import { DomElement } from "../interface/element";

export function getRelevantElements() {
  /**
   * for now, we classify relevant elements as elements that are <= RADIUS
   * distance away from the estimate of the vision model
   */
  return getElementsWithinRadiusOfEstimate();
}

const DEFAULT_RADIUS = 200;
function getElementsWithinRadiusOfEstimate(): DomElement[] {
  const interactiveElements = getInteractiveElements();

  const elements: DomElement[] = Array.from(interactiveElements)
    .filter(
      (el) =>
        getComputedStyle(el).visibility !== "hidden" &&
        getComputedStyle(el).display !== "none",
    )
    .map((el, idx) => ({
      // core semantic info
      tagName: el.tagName,
      textContent: el.textContent?.trim() ?? "",
      role: el.getAttribute("role") ?? "",
      ariaLabel: el.getAttribute("aria-label") ?? "",
      ariaRole: el.getAttribute("aria-role") ?? "",
      parentInfo: {
        tagName: el.parentElement?.tagName ?? "",
        className: el.parentElement?.className ?? "",
        textContent: getParentTextContent(el, 20),
      },

      // visual info
      boundingRect: el.getBoundingClientRect(),

      // to grab the element
      index: idx,
      querySelector: getElementSelector(el) ?? "",
    }))
    .filter(
      (el) =>
        el.boundingRect.x > 0 &&
        el.boundingRect.y > 0 &&
        el.boundingRect.width > 0 &&
        el.boundingRect.height > 0,
    )
    .filter((el) => {
      const rect = el.boundingRect;
      const viewportWidth =
        window.innerWidth || document.documentElement.clientWidth;
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;

      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= viewportHeight &&
        rect.right <= viewportWidth
      );
    });

  return elements;
}

function getInteractiveElements() {
  const interactiveElements = new Set([
    "a",
    "button",
    "details",
    "input",
    "label",
    "menu",
    "menuitem",
    "select",
    "span",
    "summary",
    "textarea",
    "tr",
    "td",
  ]);

  const interactiveRoles = new Set([
    "a-button-inner",
    "a-button-text",
    "a-dropdown-button",
    "button",
    "button-icon",
    "button-icon-only",
    "button-text",
    "button-text-icon-only",
    "checkbox",
    "click",
    "combobox",
    "dropdown",
    "grid",
    "link",
    "listbox",
    "menu",
    "menuitem",
    "menuitemcheckbox",
    "menuitemradio",
    "option",
    "progressbar",
    "radio",
    "scrollbar",
    "searchbox",
    "slider",
    "switch",
    "tab",
    "tabpanel",
    "textbox",
    "tooltip",
  ]);

  const elements = Array.from(document.querySelectorAll("*")).filter((el) => {
    const tagName = el.tagName.toLowerCase();
    const role = el.getAttribute("role");
    const ariaRole = el.getAttribute("aria-role");

    return (
      interactiveElements.has(tagName) ||
      (role && interactiveRoles.has(role)) ||
      (ariaRole && interactiveRoles.has(ariaRole))
    );
  });

  return elements;
}

function getElementSelector(el: Element): string {
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

function getParentTextContent(
  el: Element,
  maxDepth: number = 20,
  stopAtElements: string[] = ["body"],
  maxLength: number = 100,
): string {
  let textContent = "";
  let currentDepth = 0;
  let currentElement: Node | null = el;

  while (
    currentElement &&
    currentDepth < maxDepth &&
    !stopAtElements.includes(currentElement.nodeName.toLowerCase()) &&
    textContent.length < maxLength
  ) {
    if (currentElement.nodeType === Node.ELEMENT_NODE) {
      const element = currentElement as Element;
      const elementText = element.textContent?.trim() || "";

      if (textContent.length + elementText.length <= maxLength) {
        textContent = elementText;
      } else {
        textContent = `${elementText.slice(0, maxLength)}...`;
        break; // Stop collecting text if the length exceeds maxLength
      }
    }

    currentElement = currentElement.parentNode;
    currentDepth++;
  }

  return textContent;
}
