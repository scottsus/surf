import { completeSentenceResponseSchema } from "@repo/ai-schemas";
import { defaultProvider } from "~/src/lib/ai/clients/default-provider";
import { generateObject } from "ai";

interface RequestBody {
  currentSentence: string;
}

// @TODO make this streaming
export async function POST(req: Request) {
  try {
    const { currentSentence } = (await req.json()) as RequestBody;

    const { object } = await generateObject({
      model: defaultProvider,
      system: `You are a sentence completer. Given a partially complete sentence, your job is to complete it as factually as you possibly can.
      
      Here's an example:
       - currentSentence: in 2020, the Prime Minister of Singapore was
       - completion: Lee Hsien Loong.

      Here are some things to take note of:
       1. if you don't know the answer, just say ok: false
       2. don't repeat the whole sentence, just the completion
      `,
      messages: [
        {
          role: "user",
          content: currentSentence,
        },
      ],
      schema: completeSentenceResponseSchema,
    });

    return new Response(JSON.stringify(object), { status: 200 });
  } catch (err) {
    console.error("estimateElementLocation:", err);
    return new Response(JSON.stringify(err), { status: 500 });
  }
}
