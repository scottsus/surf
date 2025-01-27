import { MinifiedElement } from "@repo/types";
import { CursorCoordinate } from "@src/pages/majordomo/provider";
import { MutableRefObject } from "react";
import { toast } from "sonner";

import { chooseActionAndQuerySelector } from "../ai/api/choose-action-and-query-selector";
import { USE_WITH_SUBMIT } from "../env";
import { ActionMetadata } from "../interface/action-metadata";
import { sleep } from "../utils";

export async function generateAction({
  userIntent,
  minifiedElements,
  history,
}: {
  userIntent: string;
  minifiedElements: MinifiedElement[];
  history: ActionMetadata[][];
}) {
  const actionStep = await chooseActionAndQuerySelector({
    userIntent,
    minifiedElements,
    history,
  });

  return actionStep;
}

/**
 * only available via background script
 */
export async function takeScreenshot() {
  const res = await new Promise<{
    ok: boolean;
    screenshot: string;
  }>((resolve) => {
    const extensionElement = document.getElementById("majordomo");
    if (extensionElement) {
      extensionElement.classList.add("hidden");
    }

    chrome.runtime.sendMessage({ action: "screenshot" }, (response) => {
      if (extensionElement) {
        extensionElement.classList.remove("hidden");
      }
      resolve(response);
    });
  });

  return res;
}

/**
 * only available via background script
 */
export async function takeNavigateAction({ url }: { url: string }) {
  await sleep(500); // show navigation status
  const runnable = async () => {
    await new Promise<void>((resolve) => {
      chrome.runtime.sendMessage({ action: "navigate", url }, resolve);
    });
  };

  return { runnable };
}

export async function takeClarifyAction({
  clarifyInputRef,
  overlayBlurRef,
}: {
  clarifyInputRef: MutableRefObject<(() => Promise<string>) | null>;
  overlayBlurRef: MutableRefObject<((blur: boolean) => void) | null>;
}) {
  const runnable = async () => {
    const clarifyInput = clarifyInputRef.current;
    const overlayBlur = overlayBlurRef.current;
    if (clarifyInput) {
      if (overlayBlur) {
        overlayBlur(true);
      }
      const userClarification = await clarifyInput();
      if (overlayBlur) {
        overlayBlur(false);
      }
      return { userClarification };
    }
    return null;
  };

  return { runnable };
}

export async function takeClickAction({
  querySelector,
  cursorOpts,
}: {
  querySelector: string;
  cursorOpts: {
    performClickRef: MutableRefObject<(() => void) | null>;
    updateCursorPosition: (coord: CursorCoordinate) => Promise<void>;
    setCursorPosition: React.Dispatch<React.SetStateAction<CursorCoordinate>>;
  };
}): Promise<{
  runnable?: (() => Promise<any>) | undefined;
}> {
  const runnable = async () => {
    await moveToElement({ querySelector, cursorOpts });
  };

  return { runnable };
}

export async function takeInputAction({
  querySelector,
  content,
  withSubmit,
  cursorOpts,
}: {
  querySelector: string;
  content: string;
  withSubmit: boolean;
  cursorOpts: {
    performClickRef: MutableRefObject<(() => void) | null>;
    updateCursorPosition: (coord: CursorCoordinate) => Promise<void>;
    setCursorPosition: React.Dispatch<React.SetStateAction<CursorCoordinate>>;
  };
}): Promise<{
  runnable?: (() => Promise<void>) | undefined;
}> {
  const runnable = async () => {
    const { element } = await moveToElement({ querySelector, cursorOpts });
    if (!element) {
      toast.error("unable to move to element");
    }

    const inputElement = element as HTMLElement;
    if (
      inputElement instanceof HTMLInputElement ||
      inputElement instanceof HTMLTextAreaElement
    ) {
      inputElement.value = content;
    } else if (inputElement.isContentEditable) {
      inputElement.textContent = content;
    }
    if (USE_WITH_SUBMIT) {
      if (withSubmit) {
        await sleep(200);
        inputElement.closest("form")?.submit();
      }
    }
  };

  return { runnable };
}

export async function takeRefreshAction() {
  const runnable = async () => {
    await new Promise<void>((resolve) => {
      chrome.runtime.sendMessage({ action: "refresh" }, resolve);
    });
  };

  return { runnable };
}

export async function takeBackAction() {
  const runnable = async () => {
    await new Promise<void>((resolve) => {
      chrome.runtime.sendMessage({ action: "back" }, resolve);
    });
  };

  return { runnable };
}

async function moveToElement({
  querySelector,
  cursorOpts,
}: {
  querySelector: string;
  cursorOpts: {
    performClickRef: MutableRefObject<(() => void) | null>;
    updateCursorPosition: (coord: CursorCoordinate) => Promise<void>;
    setCursorPosition: React.Dispatch<React.SetStateAction<CursorCoordinate>>;
  };
}): Promise<{ ok: boolean; element: Element | null }> {
  try {
    const target = document.querySelector(querySelector);
    if (!target) {
      toast.error("no element found");
      return { ok: false, element: null };
    }

    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let newCoords: CursorCoordinate = { x: 0, y: 0 };

    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;
    await new Promise<void>((resolve) => {
      const intervalId = setInterval(async () => {
        cursorOpts.setCursorPosition((prev) => {
          const newX = prev.x + (centerX - prev.x) * 0.3;
          const newY = prev.y + (centerY - prev.y) * 0.3;

          if (Math.abs(newX - centerX) < 1 && Math.abs(newY - centerY) < 1) {
            clearInterval(intervalId);

            timeoutId = setTimeout(async () => {
              const events = ["mousedown", "mouseup", "click"];
              const performClick = cursorOpts.performClickRef.current;
              if (performClick) {
                performClick();
                await sleep(500);
              }

              events.forEach((eventType) => {
                const event = new MouseEvent(eventType, {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                  clientX: centerX,
                  clientY: centerY,
                });
                target.dispatchEvent(event);
              });

              resolve(); // this ends the await
            }, 500);
          }

          newCoords = { x: newX, y: newY };
          return newCoords;
        });
      }, 16);
    });

    const cleanup = () => {
      clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
    window.addEventListener("error", cleanup);

    return { ok: true, element: target };
  } catch (err) {
    console.log(`selector: ${querySelector}, error: ${err}`);
    return { ok: false, element: null };
  }
}

export function printHistory(history: ActionMetadata[]) {
  console.log("---------\n");
  for (const h of history) {
    console.log(`${h.summary}, ${h.querySelector}`);
  }
}
