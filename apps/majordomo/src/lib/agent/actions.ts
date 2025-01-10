import { StateMachineInput } from "@rive-app/react-canvas";
import { CursorCoordinate } from "@src/pages/majordomo/provider";
import { toast } from "sonner";

import { chooseAction } from "../ai/api/choose-action";
import { chooseQuerySelector } from "../ai/api/choose-query-selector";
import { getRelevantElements } from "../dom/get-elements";
import { Action } from "../interface/action";
import { ActionMetadata } from "../interface/action-metadata";
import { ThinkingState } from "../interface/thinking-state";
import { sleep } from "../utils";

export async function generateAction({
  screenshot,
  userIntent,
  history,
}: {
  screenshot: string;
  userIntent: string;
  history: ActionMetadata[];
}) {
  const action = (await chooseAction({
    userIntent,
    screenshot,
    history,
  })) as Action | undefined;
  if (!action) {
    throw new Error("generateAction: undefined");
  }

  return { action };
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

export async function takeClickAction({
  agentIntent,
  history,
  setThinkingState,
  cursorOpts,
}: {
  agentIntent: string;
  history: ActionMetadata[];
  setThinkingState: React.Dispatch<React.SetStateAction<ThinkingState>>;
  cursorOpts: {
    clickAction: StateMachineInput | null;
    updateCursorPosition: (coord: CursorCoordinate) => Promise<void>;
    setCursorPosition: React.Dispatch<React.SetStateAction<CursorCoordinate>>;
    setCursorPositionEstimate: React.Dispatch<
      React.SetStateAction<CursorCoordinate>
    >;
  };
}): Promise<{
  querySelector: string;
  runnable?: (() => Promise<any>) | undefined;
}> {
  const querySelectorResponse = await getQuerySelector({
    agentIntent,
    history,
    cursorOpts,
  });
  if (!querySelectorResponse) {
    return { querySelector: "error" };
  }

  setThinkingState({ type: "clicking_button" });

  const runnable = async () => {
    await moveToElement(querySelectorResponse);
  };

  return { querySelector: querySelectorResponse.querySelector, runnable };
}

export async function takeInputAction({
  inputDescription,
  content,
  action,
  history,
  setThinkingState,
  cursorOpts,
}: {
  inputDescription: string;
  content: string;
  action: Action;
  history: ActionMetadata[];
  setThinkingState: React.Dispatch<React.SetStateAction<ThinkingState>>;
  cursorOpts: {
    clickAction: StateMachineInput | null;
    updateCursorPosition: (coord: CursorCoordinate) => Promise<void>;
    setCursorPosition: React.Dispatch<React.SetStateAction<CursorCoordinate>>;
    setCursorPositionEstimate: React.Dispatch<
      React.SetStateAction<CursorCoordinate>
    >;
  };
}): Promise<{
  querySelector: string;
  runnable?: (() => Promise<void>) | undefined;
}> {
  const querySelectorResponse = await getQuerySelector({
    agentIntent: inputDescription,
    history,
    cursorOpts,
  });
  if (!querySelectorResponse) {
    toast.error("unable to get particular query selector");
    return { querySelector: "error" };
  }

  setThinkingState({ type: "clicking_button" });

  const runnable = async () => {
    const { element } = await moveToElement(querySelectorResponse);
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
    if (action.type === "input" && action.withSubmit) {
      await sleep(200);
      inputElement.closest("form")?.submit();
    }
  };

  return { querySelector: querySelectorResponse.querySelector, runnable };
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

async function getQuerySelector({
  agentIntent,
  history,
  cursorOpts,
}: {
  agentIntent: string;
  history: ActionMetadata[];
  cursorOpts: {
    clickAction: StateMachineInput | null;
    updateCursorPosition: (coord: CursorCoordinate) => Promise<void>;
    setCursorPosition: React.Dispatch<React.SetStateAction<CursorCoordinate>>;
    setCursorPositionEstimate: React.Dispatch<
      React.SetStateAction<CursorCoordinate>
    >;
  };
}) {
  const relevantElements = getRelevantElements();
  const querySelectorResponse = await chooseQuerySelector({
    userIntent: agentIntent,
    relevantElements,
    history,
  });
  if (!querySelectorResponse) {
    toast.error("unable to choose query selector");
    return;
  }

  const targetElement = relevantElements.find(
    (el) => el.index === querySelectorResponse.index,
  );
  if (!targetElement) {
    toast.error("unable to find target element");
    return;
  }
  console.log("target:", targetElement);

  const { querySelector, boundingRect } = targetElement;

  return {
    querySelector,
    targetX: boundingRect.x,
    targetY: boundingRect.y,
    cursorOpts,
  };
}

async function moveToElement({
  querySelector,
  cursorOpts,
}: {
  querySelector: string;
  cursorOpts: {
    clickAction: StateMachineInput | null;
    updateCursorPosition: (coord: CursorCoordinate) => Promise<void>;
    setCursorPosition: React.Dispatch<React.SetStateAction<CursorCoordinate>>;
    setCursorPositionEstimate: React.Dispatch<
      React.SetStateAction<CursorCoordinate>
    >;
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

            // @TODO: update this or remove
            // cursorOpts.updateCursorPosition(newCoords);

            const element = document.elementFromPoint(
              centerX,
              centerY,
            ) as HTMLElement;

            timeoutId = setTimeout(() => {
              const events = ["mousedown", "mouseup", "click"];
              cursorOpts.clickAction && cursorOpts.clickAction.fire();
              events.forEach((eventType) => {
                const event = new MouseEvent(eventType, {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                  clientX: centerX,
                  clientY: centerY,
                });
                element.dispatchEvent(event);
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
