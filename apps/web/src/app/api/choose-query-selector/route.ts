import { chooseQuerySelectorResponseSchema } from "@repo/ai-schemas";
import { defaultProvider } from "~/src/lib/ai/clients/default-provider";
import { generateObject } from "ai";

const LOG_PROMPT = process.env.NODE_ENV === "development" && true;

interface RequestBody {
  userIntent: string;
  relevantElements: string[];
  history: any[];
}

export async function POST(req: Request) {
  try {
    const { userIntent, relevantElements, history } =
      (await req.json()) as RequestBody;

    const MAX_PROMPT_LEN = 128_000;

    const prevQuerySelector =
      history.length >= 2
        ? history[history.length - 2]?.querySelector
        : "noPreviousQuerySelector";

    const prompt = `User Intent: ${userIntent}\n
        
        Here is a list of possible elements you can interact with:
        ${relevantElements.join("\n-------------\n")}
    
        The previous querySelector was: ${prevQuerySelector}
        `.slice(0, MAX_PROMPT_LEN);
    if (LOG_PROMPT) {
      console.log(prompt);
    }

    const { object } = await generateObject({
      headers: {
        // @TODO needed to bypass CORS
        "anthropic-dangerous-direct-browser-access": "true",
      },
      model: defaultProvider,
      system: `You are an expert screen reader, and your job is to pick the most relevant query selectors for a given user intent.
          
          Here are some things to pay attention to:
           1. usually, aria label is the most important marker
           2. bounding rectangle is another telltale: if x, y, width, or height are 0, it's unlikely to be an interactive element for humans
           3. once you've chosen the appropriate query selector, just return the index of the query selector
           4. pay attention to the previous querySelector - usually you don't want to pick the same one twice, but do so if you deem it necessary
          `,
      prompt,
      schema: chooseQuerySelectorResponseSchema,
    });

    return new Response(JSON.stringify(object), { status: 200 });
  } catch (err) {
    console.error("chooseQuerySelector:", err);
    return new Response(JSON.stringify(err), { status: 500 });
  }
}
