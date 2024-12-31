export function getRelevantElements({
  opts,
}: {
  opts: {
    xEstimate: number;
    yEstimate: number;
  };
}) {
  const { xEstimate, yEstimate } = opts;

  /**
   * for now, we classify relevant elements as elements that are <= RADIUS
   * distance away from the estimate of the vision model
   */
  return getElementsWithinRadiusOfEstimate({ xEstimate, yEstimate });
}

const DEFAULT_RADIUS = 200;
function getElementsWithinRadiusOfEstimate({
  xEstimate,
  yEstimate,
  radius = DEFAULT_RADIUS,
}: {
  xEstimate: number;
  yEstimate: number;
  radius?: number;
}): DomElement[] {
  const interactiveElements = getInteractiveElements();

  const elements: DomElement[] = Array.from(interactiveElements)
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
      // find the closest point on the rectangle to the circle's center
      const closestX = Math.max(
        el.boundingRect.x,
        Math.min(xEstimate, el.boundingRect.x + el.boundingRect.width),
      );
      const closestY = Math.max(
        el.boundingRect.y,
        Math.min(yEstimate, el.boundingRect.y + el.boundingRect.height),
      );

      // distance from closest point to circle center
      const distance = Math.sqrt(
        Math.pow(closestX - xEstimate, 2) + Math.pow(closestY - yEstimate, 2),
      );

      return distance <= radius;
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
