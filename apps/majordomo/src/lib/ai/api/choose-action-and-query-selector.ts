import { chooseActionAndQuerySelectorResponseSchema } from "@repo/ai-schemas";
import { MinifiedElement, PageOpts } from "@repo/types";
import { SERVER_URL } from "@src/lib/env";
import { Action } from "@src/lib/interface/action";
import { ActionMetadata } from "@src/lib/interface/action-metadata";
import { z } from "zod";

export async function chooseActionAndQuerySelector({
  userIntent,
  minifiedElements,
  history,
  pageOpts,
}: {
  userIntent: string;
  minifiedElements: MinifiedElement[];
  history: ActionMetadata[][];
  pageOpts: PageOpts;
}): Promise<Action[]> {
  try {
    const formData = new FormData();
    formData.append("userIntent", userIntent);
    formData.append("hostname", pageOpts.hostname);
    formData.append("htmlDom", JSON.stringify(minifiedElements));
    formData.append("history", JSON.stringify(history));

    const res = await fetch(
      `${SERVER_URL}/api/choose-action-and-query-selector`,
      {
        method: "POST",
        body: formData,
      },
    );
    if (!res.ok) {
      throw new Error("non-2xx http status");
    }

    const data = (await res.json()) as z.infer<
      typeof chooseActionAndQuerySelectorResponseSchema
    >;
    return data.actions as Action[];
  } catch (err) {
    console.error("chooseAction:", err);
    return [];
  }
}
