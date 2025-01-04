import { chooseActionResponseSchema } from "@repo/ai-schemas";
import { defaultProvider } from "~/src/lib/ai/clients/default-provider";
import { generateObject } from "ai";

const LOG_PREV_ACTIONS = process.env.NODE_ENV === "development" && true;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userIntent = formData.get("userIntent") as string | null;
    const screenshotStr = formData.get("screenshot") as string | null;
    const historyStr = formData.get("history") as string | null;

    if (!userIntent || !screenshotStr) {
      throw new Error("missing userIntent or screenshot fields");
    }
    const screenshot = screenshotStr.split(",")[1];
    if (!screenshot) {
      throw new Error(
        "screenshot must take the form data:image/png;base64,xxx...",
      );
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
      console.log("Previous actions:\n\n", prevActions);
    }

    const { object } = await generateObject({
      headers: {
        // @TODO needed to bypass CORS
        "anthropic-dangerous-direct-browser-access": "true",
      },
      model: defaultProvider,
      system: `You are a compiler. Given a userIntent in natural language, and an image of what the user currently sees,
       you pick the best action on what to do next in this webpage from a list of possible actions.

      An action takes the following form:
      type Action =
        | { type: "navigate"; url: string }
        | { type: "click"; buttonDescription: string }
        | { type: "input"; inputDescription: string; content: string }
        | { type: "refresh" }
        | { type: "back" }
        | { type: "done" }
      
      Furthermore, you can only click on one thing at a time, so if you need to click on multiple things, just choose the next
      one on the list, as opposed to including all of them in the description.
      
      You will also receive a sequence of previously attempted actions. These actions are only attempted, and are not guaranteed
      to be completed, so please check from the screenshot to determine whether you need to retry or continue the latest action.

      Most of the time, the previous actions should be successful, so unless you have strong evidence that a previous action was
      unsuccessful, assume the previous action was already completed!
      
      Here are some things to pay attention to:
       1. remember that some actions require additional attributes
       2. make sure to only pick 1 of those 5 options.
       3. look at the previous string of actions! there's a good chance you're already done.
      `,
      messages: [
        {
          role: "user",
          content: userIntent,
        },
        {
          role: "user",
          content: `Here is the sequence of previously attempted actions:\n${prevActions}.`,
        },
        {
          role: "user",
          content: [{ type: "image", image: screenshot }],
        },
      ],
      schema: chooseActionResponseSchema,
    });

    return new Response(JSON.stringify(object), { status: 200 });
  } catch (err) {
    console.error("chooseAction:", err);
    return new Response(JSON.stringify(err), { status: 500 });
  }
}
