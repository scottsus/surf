import { chooseActionAndQuerySelectorResponseSchema } from "@repo/ai-schemas";
import { minifiedElementToString } from "@repo/types/element";
import { claudeHaiku, claudeSonnet } from "~/src/lib/ai/clients/anthropic";
import { generateObject } from "ai";

const LOG_MINIFIED_DOM = process.env.NODE_ENV === "development" && false;
const LOG_PREV_ACTIONS = process.env.NODE_ENV === "development" && false;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userIntent = formData.get("userIntent") as string | null;
    const htmlDomStr = formData.get("htmlDom") as string | null;
    const historyStr = formData.get("history") as string | null;

    if (!userIntent) {
      throw new Error("missing userIntent");
    }

    const htmlDom = htmlDomStr ? JSON.parse(htmlDomStr) : [];
    const htmlDomInput = `Here is a list of DOM elements to choose from:
    ${htmlDom.map(minifiedElementToString)}`;
    if (LOG_MINIFIED_DOM) {
      console.log("minified DOM:", htmlDomInput);
    }

    const history = historyStr ? JSON.parse(historyStr) : [];
    const prevActions =
      history?.length && history.length > 0
        ? history
            .map(
              (action: any, index: number) => `${index + 1}. ${action.summary}`,
            )
            .join("\n\n")
        : [];
    if (LOG_PREV_ACTIONS && prevActions) {
      console.log("previous actions:\n", prevActions);
    }

    const { object } = await generateObject({
      model: claudeSonnet,
      system: `You are a compiler. Given a userIntent in natural language, and a custom minified DOM tree,
       you pick the best action on what to do next in this webpage from a list of possible actions.

      By action, I mean you pick the 'idx' of the custom element that you think is likely to be pressed.

      An action takes the following form:
      type Action =
      | { type: "navigate"; url: string }
      | { type: "click"; idx: number }
      | {
          type: "input";
          idx: number;
          content: string;
          withSubmit: boolean;
          }
      | { type: "refresh" }
      | { type: "back" }
      | { type: "done" };
      
      You will also receive a sequence of previously attempted actions. These actions are only attempted, and are not guaranteed
      to be completed, so please check from the screenshot to determine whether you need to retry or continue the latest action.

      Most of the time, the previous actions should be successful, so unless you have strong evidence that a previous action was
      unsuccessful, assume the previous action was already completed!
      
      Here are some things to pay attention to:
       1. remember that some actions require additional attributes
       2. look at the previous string of actions! there's a good chance you're already done.
      `,
      messages: [
        {
          role: "user",
          content: userIntent,
        },
        {
          role: "user",
          content: htmlDomInput,
        },
        {
          role: "user",
          content: `Here is the sequence of previously attempted actions:\n${prevActions}.`,
        },
      ],
      schema: chooseActionAndQuerySelectorResponseSchema,
    });

    return new Response(JSON.stringify(object), { status: 200 });
  } catch (err) {
    console.error("chooseAction:", err);
    return new Response(JSON.stringify(err), { status: 500 });
  }
}
