import fs from "fs";
import path from "path";
import { chooseActionAndQuerySelectorResponseSchema } from "@repo/ai-schemas";
import { MinifiedElement, minifiedElementToString } from "@repo/types";
import { claudeSonnet } from "~/src/lib/ai/clients/anthropic";
import { generateObject } from "ai";
import { z } from "zod";

import { constructPrompt } from "./prompts";

const MAX_HTML_DOM_LEN = 150_000;
const LOG_MINIFIED_DOM = process.env.NODE_ENV === "development" && true;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userIntent = formData.get("userIntent") as string | null;
    const hostname = formData.get("hostname") as string | null;
    const htmlDomStr = formData.get("htmlDom") as string | null;
    const historyStr = formData.get("history") as string | null;

    if (!userIntent) {
      throw new Error("missing userIntent");
    }

    const htmlDom: MinifiedElement[] = htmlDomStr ? JSON.parse(htmlDomStr) : [];
    const htmlDomInput = `Here is a list of DOM elements to choose from:
    ${htmlDom.map(minifiedElementToString).join("\n").substring(0, MAX_HTML_DOM_LEN)}`;
    if (LOG_MINIFIED_DOM) {
      const filePath = path.join(process.cwd(), "minified_dom.txt");
      fs.appendFileSync(filePath, htmlDomInput);
      console.log(`Minified DOM saved to ${filePath}`);
    }

    const history: any[][] = historyStr ? JSON.parse(historyStr) : [];
    const prevActions =
      history?.length && history.length > 0
        ? history
            .reverse()
            .map((actionBatch, outerIndex) =>
              actionBatch
                .reverse()
                .map(
                  (action: any, innerIndex: number) =>
                    `${history.length - outerIndex}.${actionBatch.length - innerIndex}. ${action.summary}`,
                )
                .join("\n"),
            )
            .join("\n\n")
        : [];
    if (prevActions) {
      console.log("\nPrevious actions:\n", prevActions);
    }

    const { object } = await generateObject({
      model: claudeSonnet,
      system: constructPrompt(hostname as string),
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

    const actions = filterActions(object);
    console.log("\nNext actions:", actions);

    return new Response(JSON.stringify({ actions }), { status: 200 });
  } catch (err) {
    console.error("chooseAction:", err);
    return new Response(JSON.stringify(err), { status: 500 });
  }
}

function filterActions(
  object: z.infer<typeof chooseActionAndQuerySelectorResponseSchema>,
) {
  const { actions } = object;
  if (actions.length === 1 && actions[0]?.type === "done") {
    return actions;
  }

  return actions
    .filter((action) => action.type !== "done")
    .filter((action) => action.idx !== -1);
}
