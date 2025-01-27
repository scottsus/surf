import fs from "fs";
import path from "path";
import { chooseActionAndQuerySelectorResponseSchema } from "@repo/ai-schemas";
import { minifiedElementToString } from "@repo/types/element";
import { claudeSonnet } from "~/src/lib/ai/clients/anthropic";
import { generateObject } from "ai";

const LOG_MINIFIED_DOM = process.env.NODE_ENV === "development" && true;
const LOG_PREV_ACTIONS = process.env.NODE_ENV === "development" && true;

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
    ${htmlDom.map(minifiedElementToString).join("\n")}`;
    if (LOG_MINIFIED_DOM) {
      const filePath = path.join(process.cwd(), "minified_dom.txt");
      fs.appendFileSync(filePath, htmlDomInput);
      console.log(`Minified DOM saved to ${filePath}`);
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
      system: `You are a browser agent. Given a userIntent in natural language, and a custom minified DOM tree,
      you pick the best action on what to do next in this webpage from a list of possible actions.
      
      An action takes the following form:
       type Action =
       | { type: "navigate"; url: string }
       | { type: "clarify"; question: string }
       | { type: "click"; idx: number; description: string }
       | {
        type: "input";
        idx: number;
        content: string;
        withSubmit: boolean;
        }
        | { type: "refresh" }
        | { type: "back" }
        | { type: "done" };
      Picking an action, pick the 'idx' of the custom element that you think is likely to be pressed.

      For the very first action, you usually wnat to clarify with the user. Ask a descriptive question to confirm with the
      user that is exactly what they want. You MUST check the previous actions to check if you've already asked a clarifying
      question. Don't be obnoxious and ask too many times.

      @TODO: add this to the userIntent
      Pay special attention to the previous actions. Often times, a clarifying question has already been answered. Pay special
      attention to user said: xxx.

      Now instead of a single action, if you can do a few intermediate small steps, be sure to do that as well.
      For instance, if you're sending an email, you might as well insert the sender(s), subject, and body as 3 intermediate
      steps.
      
      Otherwise, don't force it. If you have an action that does not have an associated query selector, just return an id of -1.

      @TODO: for OpenTable demo purposes
      Today's date is ${new Date().toDateString()}. Use this information for OpenTable.
      If on OpenTable, the date is already set, so just choose the time!
      On OpenTable, here are relevant details:
      Name: Chris Pramana
      Phone: 3107159983
      Email: cpramana@gmail.com
      Uncheck "add this card to your account" and "sign me up to receive dining offers"

      You will also receive a sequence of previously attempted actions. These actions are only attempted, and are not guaranteed
      to be completed, so please check from the screenshot to determine whether you need to retry or continue the latest action.

      Here are some things to pay attention to:
       1. remember that some actions require additional attributes
       2. look at the previous string of actions! there's a good chance you're already done.
      `,
      messages: [
        {
          role: "user",
          content: `Here is the sequence of previously attempted actions:\n${prevActions}.`,
        },
        {
          role: "user",
          content: userIntent,
        },
        {
          role: "user",
          content: htmlDomInput,
        },
      ],
      schema: chooseActionAndQuerySelectorResponseSchema,
    });

    const actions = object.actions.filter((el) => el.idx !== -1);

    return new Response(JSON.stringify({ actions }), { status: 200 });
  } catch (err) {
    console.error("chooseAction:", err);
    return new Response(JSON.stringify(err), { status: 500 });
  }
}
