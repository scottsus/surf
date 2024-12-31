import { estimateElementLocationResponseSchema } from "@repo/ai-schemas";
import { defaultProvider } from "~/src/lib/ai/clients/default-provider";
import { generateObject } from "ai";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userIntent = formData.get("userIntent") as string | null;
    const screenshotStr = formData.get("screenshot") as string | null;
    const dimensions = formData.get("dimensions") as {
      width: number;
      height: number;
    } | null;

    const screenshot = screenshotStr?.split(",")[1];
    if (!userIntent || !screenshot || !dimensions) {
      throw new Error(
        "missing some of 'userIntent', 'screenshot', or 'dimensions'",
      );
    }

    const input = `User Intent: ${userIntent}
    The image dimensions are: [${dimensions.width}x${dimensions.height}]`;

    const { object } = await generateObject({
      headers: {
        // @TODO needed to bypass CORS
        "anthropic-dangerous-direct-browser-access": "true",
      },
      model: defaultProvider,
      system: `You are an image expert, and you're one of the best in the world at estimating pixel values.
      
      Given a user intent
       1. select the web UI element that most closely resembles the user's intention
       2. use the image dimensions as a starting point
       3. estimate the pixel value at that location
       
      NOTE: xEstimate and yEstimate MUST BE 2 SEPARATE NUMBERS!!!
      Remember, xEstimate should be a SINGLE x-coordinate, and yEstimate should be a SINGLE y-coordinate. Don't mix the 2 together.
      BAD example: { ok: true, xEstimate: 100,200, yEstimate: 200} - notice 2 values in "xEstimate" instead of 1!!!
      GOOD example: { ok: true, xEstimate: 100, yEstimate: 200}
      ESPECIALLY REMEMBER THIS PART MY LIFE DEPENDS ON IT!!!
      `, // @TODO optimize this
      messages: [
        {
          role: "user",
          content: input,
        },
        {
          role: "user",
          content: [{ type: "image", image: screenshot }],
        },
      ],
      schema: estimateElementLocationResponseSchema,
    });

    return new Response(JSON.stringify(object), { status: 200 });
  } catch (err) {
    console.error("estimateElementLocation:", err);
    return new Response(JSON.stringify(err), { status: 500 });
  }
}
