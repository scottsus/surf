import { evaluateActionsResponseSchema } from "@repo/ai-schemas";
import { MinifiedElement } from "@repo/types";
import { SERVER_URL } from "@src/lib/env";
import { ActionMetadata } from "@src/lib/interface/action-metadata";
import { z } from "zod";

export async function evaluateActions({
  latestActions,
  minifiedElements,
}: {
  latestActions: ActionMetadata[];
  minifiedElements: MinifiedElement[];
}): Promise<boolean[]> {
  try {
    const formData = new FormData();
    formData.append("actions", JSON.stringify(latestActions));
    formData.append("htmlDom", JSON.stringify(minifiedElements));

    const res = await fetch(`${SERVER_URL}/api/evaluate-actions`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      throw new Error("non-2xx http status");
    }

    const data = (await res.json()) as z.infer<
      typeof evaluateActionsResponseSchema
    >;
    return data.evaluation;
  } catch (err) {
    console.error("evaluateActions:", err);
    return [];
  }
}
