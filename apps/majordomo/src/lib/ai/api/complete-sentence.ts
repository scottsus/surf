import { completeSentenceResponseSchema } from "@repo/ai-schemas";
import { SERVER_URL } from "@src/lib/env";
import { z } from "zod";

// @TODO make this streaming
export async function completeSentence({
  currentSentence,
}: {
  currentSentence: string;
}) {
  try {
    const res = await fetch(`${SERVER_URL}/api/complete-sentence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentSentence }),
    });
    if (!res.ok) {
      throw new Error("non-2xx http status");
    }

    const data = (await res.json()) as z.infer<
      typeof completeSentenceResponseSchema
    >;
    return data;
  } catch (err) {
    console.error("estimateElementLocation:", err);
  }
}
