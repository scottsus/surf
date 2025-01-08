import { chooseQuerySelectorResponseSchema } from "@repo/ai-schemas";
import { SERVER_URL } from "@src/lib/env";
import { ActionMetadata } from "@src/lib/interface/action-metadata";
import { DomElement } from "@src/lib/interface/element";
import { z } from "zod";

export async function chooseQuerySelector({
  userIntent,
  relevantElements,
  history,
}: {
  userIntent: string;
  relevantElements: DomElement[];
  history: ActionMetadata[];
}) {
  try {
    const res = await fetch(`${SERVER_URL}/api/choose-query-selector`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userIntent,
        relevantElements: JSON.stringify(relevantElements),
        history: history.map((h) => JSON.stringify(h)),
      }),
    });
    if (!res.ok) {
      throw new Error("non-2xx http status");
    }

    const data = (await res.json()) as z.infer<
      typeof chooseQuerySelectorResponseSchema
    >;
    return data;
  } catch (err) {
    console.error("chooseQuerySelector:", err);
  }
}

function elementToString(el: DomElement) {
  const MAX_TEXT_LEN = 2_048;

  const rect = el.boundingRect;

  return `Element: ${el.tagName.toLowerCase()}
    Text: ${el.textContent.slice(0, MAX_TEXT_LEN)}
    Role: ${el.role}
    Aria Label: ${el.ariaLabel}
    Aria Role: ${el.ariaRole}
    Parent: ${el.parentInfo.textContent}
    Bounding Rectangle: [x: ${rect.x}, y: ${rect.y}, width: ${rect.width}, height: ${rect.height}]
    Index: ${el.index}
    Query Selector: ${el.querySelector}
    `;
}
