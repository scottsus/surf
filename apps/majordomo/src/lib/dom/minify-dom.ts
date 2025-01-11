import { MinifiedElement } from "@repo/types/element";

export function minifyDom(document: HTMLElement): MinifiedElement[] {
  const minifiedDom: MinifiedElement[] = [];

  const elements = document.querySelectorAll("*");
  elements.forEach((el, idx) => {
    const role = el.getAttribute("role");
    if (
      !role ||
      role === "style" ||
      role === "script" ||
      role === "main" ||
      role === "grid" ||
      role === "table" ||
      role === "contentinfo" ||
      role === "complementary" ||
      role === "banner" ||
      role === "navigation" ||
      role === "tabpanel"
    )
      return;

    const tag = role;
    let topic =
      el.getAttribute("aria-label") ||
      (el.textContent?.replace(/\s/g, "") as string);

    if (
      el.tagName.toLowerCase() === "input" ||
      el.tagName.toLowerCase() === "checkbox"
    ) {
      const checked = el.getAttribute("checked");
      if (checked) {
        topic += ` checked="${checked}"`;
      }
    }

    const newElement: MinifiedElement = {
      tag,
      topic,
      idx,
      meta: {
        querySelector: getQuerySelector(el),
      },
    };
    minifiedDom.push(newElement);
  });

  return minifiedDom;
}

function getQuerySelector(el: Element): string {
  const path: string[] = [];
  let current = el;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      // special case for ':' like in gmail
      if (current.id.includes(":")) {
        selector += `[id="${current.id}"]`;
      } else {
        // other special characters
        selector += `#${CSS.escape(current.id)}`;
      }
      path.unshift(selector);

      // ID is unique, stop here
      break;
    }

    if (current.className) {
      const cleanedClasses = current.className
        .split(/[\s\n\r]+/) // split on whitespace
        .filter((c) => c)
        .map((className) => CSS.escape(className))
        .join(".");

      if (cleanedClasses) {
        selector += `.${cleanedClasses}`;
      }
    }

    path.unshift(selector);
    current = current.parentElement!;
  }

  return path.join(" > ");
}
