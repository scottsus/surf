import { evaluateActionsResponseSchema } from "@repo/ai-schemas";
import { claudeHaiku } from "~/src/lib/ai/clients/anthropic";
import { generateObject } from "ai";

const MAX_HTML_DOM_LEN = 150_000;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const actions = formData.get("actions") as string | null;
    const htmlDomStr = formData.get("htmlDom") as string | null;

    const { object } = await generateObject({
      model: claudeHaiku,
      system: `You are a browser agent.

      Given some attempted browser actions, and the updated a11y tree, determine if each action was
      successful or not.
      `,
      messages: [
        {
          role: "user",
          content: `Here is the sequence of previously attempted actions:\n${actions}.`,
        },
        {
          role: "user",
          content: `Here is the a11y tree: ${htmlDomStr?.substring(0, MAX_HTML_DOM_LEN)}`,
        },
      ],
      schema: evaluateActionsResponseSchema,
    });

    return new Response(JSON.stringify(object), {
      status: 200,
    });
  } catch (err) {
    console.error("chooseAction:", err);
    return new Response(JSON.stringify(err), { status: 500 });
  }
}
