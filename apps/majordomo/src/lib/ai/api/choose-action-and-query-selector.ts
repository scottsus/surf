import { chooseActionAndQuerySelectorResponseSchema } from "@repo/ai-schemas";
import { MinifiedElement } from "@repo/types";
import { SERVER_URL } from "@src/lib/env";
import { Action_v2 } from "@src/lib/interface/action";
import { ActionMetadata } from "@src/lib/interface/action-metadata";
import { z } from "zod";

export async function chooseActionAndQuerySelector({
  userIntent,
  minifiedElements,
  history,
}: {
  userIntent: string;
  minifiedElements: MinifiedElement[];
  history: ActionMetadata[][];
}): Promise<Action_v2[]> {
  try {
    const formData = new FormData();
    formData.append("userIntent", userIntent);
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
    return data.actions as Action_v2[];
  } catch (err) {
    console.error("chooseAction:", err);
    return [];
  }
}
