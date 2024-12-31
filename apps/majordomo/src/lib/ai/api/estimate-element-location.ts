import { estimateElementLocationResponseSchema } from "@repo/ai-schemas";
import { SERVER_URL } from "@src/lib/env";
import { z } from "zod";

export async function estimateElementLocation({
  userIntent,
  screenshot,
  dimensions,
}: {
  userIntent: string;
  screenshot: string;
  dimensions: { width: number; height: number };
}) {
  try {
    const formData = new FormData();
    formData.append("userIntent", userIntent);
    formData.append("screenshot", screenshot);
    formData.append("dimensions", JSON.stringify(dimensions));

    const res = await fetch(`${SERVER_URL}/api/estimate-element-location`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      throw new Error("non-2xx http status");
    }

    const data = (await res.json()) as z.infer<
      typeof estimateElementLocationResponseSchema
    >;
    return data;
  } catch (err) {
    console.error("estimateElementLocation:", err);
  }
}
