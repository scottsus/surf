import { chooseActionResponseSchema } from "@repo/ai-schemas";
import { SERVER_URL } from "@src/lib/env";
import { ActionMetadata } from "@src/lib/interface/action-metadata";
import { z } from "zod";

export async function chooseAction({
  userIntent,
  screenshot,
  history,
}: {
  userIntent: string;
  screenshot: string;
  history: ActionMetadata[];
}) {
  try {
    const formData = new FormData();
    formData.append("userIntent", userIntent);
    formData.append("screenshot", screenshot);
    formData.append("history", JSON.stringify(history));

    const res = await fetch(`${SERVER_URL}/api/choose-action`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      throw new Error("non-2xx http status");
    }

    const data = (await res.json()) as z.infer<
      typeof chooseActionResponseSchema
    >;
    return data;
  } catch (err) {
    console.error("chooseAction:", err);
  }
}
