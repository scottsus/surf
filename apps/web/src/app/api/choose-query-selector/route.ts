import { chooseQuerySelectorResponseSchema } from "@repo/ai-schemas";
import { claudeSonnet } from "~/src/lib/ai/clients/anthropic";
import { defaultProvider } from "~/src/lib/ai/clients/default-provider";
import { generateObject } from "ai";

const LOG_PROMPT = process.env.NODE_ENV === "development" && false;

interface RequestBody {
  userIntent: string;
  relevantElements: string;
  history: string[];
}

export async function POST(req: Request) {
  try {
    const { userIntent, relevantElements, history } =
      (await req.json()) as RequestBody;

    const relevantElementsParsed: DomElement[] = JSON.parse(relevantElements);

    const MAX_CHUNK_LEN = 64_000;
    const batches: string[][] = [];
    let elementBatch: string[] = [];
    let elementBatchSize = 0;
    for (const parsed of relevantElementsParsed) {
      const el = elementToString(parsed);
      if (elementBatchSize + el.length > MAX_CHUNK_LEN) {
        batches.push(elementBatch);
        elementBatch = [];
        elementBatchSize = 0;
      }
      elementBatch.push(el);
      elementBatchSize += el.length;
    }
    batches.push(elementBatch);

    const filteredRelevantElements = await Promise.all(
      batches.map(async (batch) =>
        chooseMostLikelyQuerySelector({
          userIntent,
          relevantElements: batch,
          history,
        }),
      ),
    );
    const filteredRelevantElementsFinal = filteredRelevantElements
      .map((el) =>
        relevantElementsParsed.find((parsed) => el.index === parsed.index),
      )
      .filter((el) => el !== undefined)
      .map(elementToString);

    const finalQuerySelectorIndex = await chooseMostLikelyQuerySelector({
      userIntent,
      relevantElements: filteredRelevantElementsFinal,
      history,
    });

    return new Response(JSON.stringify(finalQuerySelectorIndex), {
      status: 200,
    });
  } catch (err) {
    console.error("chooseQuerySelector:", err);
    return new Response(JSON.stringify(err), { status: 500 });
  }
}

async function chooseMostLikelyQuerySelector({
  userIntent,
  relevantElements,
  history,
}: {
  userIntent: string;
  relevantElements: string[];
  history: string[];
}) {
  const prompt = `User Intent: ${userIntent}\n
    
    Here is a list of possible elements you can interact with:
    ${relevantElements.join("\n-------------\n")}

    Here are the previously attempted (possibly completed) steps:
    ${history.join("\n==============\n")}
    `;

  if (LOG_PROMPT) {
    console.log(prompt);
  }

  const { object } = await generateObject({
    model: claudeSonnet,
    system: `You are an expert screen reader, and your job is to pick the most relevant query selectors for a given user intent.
      
      Here are some things to pay attention to:
       1. usually, aria label is the most important marker
       2. however, you should also match the targetDescription usually with text content
       3. once you've chosen the appropriate query selector, just return the index of the query selector
      `,
    prompt,
    schema: chooseQuerySelectorResponseSchema,
  });

  return object;
}

interface DomElement {
  tagName: string;
  textContent: string;
  role: string;
  ariaLabel: string;
  ariaRole: string;
  parentInfo: {
    tagName: string;
    className: string;
    textContent: string;
  };
  boundingRect: DOMRect;
  index: number;
  querySelector: string;
}

function elementToString(el: DomElement) {
  const MAX_TEXT_LEN = 2_048;

  const rect = el.boundingRect;

  return `Element: ${el.tagName.toLowerCase()}
    Text: ${el.textContent.slice(0, MAX_TEXT_LEN)}
    Role: ${el.role}
    Aria Label: ${el.ariaLabel}
    Aria Role: ${el.ariaRole}
    Parent: ${el.parentInfo.textContent});
    Bounding Rectangle: [x: ${rect.x}, y: ${rect.y}, width: ${rect.width}, height: ${rect.height}]
    Index: ${el.index}
    Query Selector: ${el.querySelector}
    `;
}
