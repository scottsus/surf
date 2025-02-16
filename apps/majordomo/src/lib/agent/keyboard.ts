import { sleep } from "../utils";

const DELAY = 20;

/**
 * @TODO: investigate if these KeyboardEvents are still needed
 * see https://developer.mozilla.org/en-US/docs/Web/API/Event/isTrusted
 */
export async function fillInput({
  input,
  content,
}: {
  input: HTMLInputElement | HTMLTextAreaElement | HTMLElement;
  content: string;
}) {
  input.focus();

  for (const key of content) {
    await sleep(DELAY);

    const keydownEvent = new KeyboardEvent("keydown", {
      key: key,
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(keydownEvent);

    const keypressEvent = new KeyboardEvent("keypress", {
      key: key,
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(keypressEvent);

    appendKey(input, key);

    const inputEvent = new Event("input", {
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(inputEvent);

    const keyupEvent = new KeyboardEvent("keyup", {
      key: key,
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(keyupEvent);
  }
}

function appendKey(
  input: HTMLInputElement | HTMLTextAreaElement | HTMLElement,
  key: string,
) {
  if (execCommandIsSupported()) {
    document.execCommand("insertText", false, key);
    return;
  }

  if (
    input instanceof HTMLInputElement ||
    input instanceof HTMLTextAreaElement
  ) {
    input.value += key;
  } else if (input.isContentEditable) {
    input.textContent += key;
  }
}

/**
 * for X.com: need this to fill the post textarea
 */
function execCommandIsSupported() {
  try {
    return document.execCommand("insertText", false, "");
  } catch (err) {
    return false;
  }
}
