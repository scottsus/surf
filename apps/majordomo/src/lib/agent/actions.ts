import { StateMachineInput } from "@rive-app/react-canvas";
import { CursorCoordinate } from "@src/pages/majordomo/provider";
import { toast } from "sonner";

import { chooseAction } from "../ai/api/choose-action";
import { chooseQuerySelector } from "../ai/api/choose-query-selector";
import { estimateElementLocation } from "../ai/api/estimate-element-location";
import { summarizeAction } from "../ai/api/summarize-action";
import { getRelevantElements } from "../dom/get-elements";
import { Action } from "../interface/action";
import { ActionMetadata } from "../interface/action-metadata";
import { ThinkingState } from "../interface/thinking-state";
import { sleep } from "../utils";
import { HistoryManager } from "./history-manager";

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
export async function takeNavigateAction({
  url,
  action,
  historyManager,
}: {
  url: string;
  action: Action;
  historyManager: HistoryManager;
}) {
  await historyManager.updateHistory({
    action,
    querySelector: "",
    summary: await summarizeAction({ action, success: true }),
  });

  await sleep(1000); // show the navigation status
  return await new Promise<void>((resolve) => {
    chrome.runtime.sendMessage({ action: "navigate", url }, resolve);
  });
}

export async function takeClickAction({
  screenshot,
  agentIntent,
  action,
  historyManager,
  opts,
}: {
  screenshot: string;
  agentIntent: string;
  action: Action;
  historyManager: HistoryManager;
  opts: {
    setThinkingState: React.Dispatch<React.SetStateAction<ThinkingState>>;
    clickAction: StateMachineInput | null;
    updateCursorPosition: (coord: CursorCoordinate) => Promise<void>;
    setCursorPosition: React.Dispatch<React.SetStateAction<CursorCoordinate>>;
    setCursorPositionEstimate: React.Dispatch<
      React.SetStateAction<CursorCoordinate>
    >;
  };
}): Promise<{ querySelector: string }> {
  const querySelectorResponse = await getQuerySelector({
    screenshot,
    agentIntent,
    history: historyManager.getLocalHistory(),
    opts,
  });
  if (!querySelectorResponse) {
    toast.error("unable to get particular query selector");
    return { querySelector: "error" };
  }

  opts.setThinkingState({ type: "clicking_button" });
  const { ok } = await moveToElement(querySelectorResponse);

  await historyManager.updateHistory({
    action,
    querySelector: querySelectorResponse.querySelector,
    summary: await summarizeAction({ action, success: ok }),
  });

  return { querySelector: querySelectorResponse.querySelector };
}

export async function takeInputAction({
  screenshot,
  inputDescription,
  content,
  action,
  historyManager,
  opts,
}: {
  screenshot: string;
  inputDescription: string;
  content: string;
  action: Action;
  historyManager: HistoryManager;
  opts: {
    setThinkingState: React.Dispatch<React.SetStateAction<ThinkingState>>;
    clickAction: StateMachineInput | null;
    updateCursorPosition: (coord: CursorCoordinate) => Promise<void>;
    setCursorPosition: React.Dispatch<React.SetStateAction<CursorCoordinate>>;
    setCursorPositionEstimate: React.Dispatch<
      React.SetStateAction<CursorCoordinate>
    >;
  };
}): Promise<{ querySelector: string }> {
  const querySelectorResponse = await getQuerySelector({
    screenshot,
    agentIntent: inputDescription,
    history: historyManager.getLocalHistory(),
    opts,
  });
  if (!querySelectorResponse) {
    toast.error("unable to get particular query selector");
    return { querySelector: "error" };
  }

  opts.setThinkingState({ type: "clicking_button" });
  const { element } = await moveToElement(querySelectorResponse);
  if (!element) {
    toast.error("unable to move to element");
    return { querySelector: "error" };
  }
  await sleep(1000);

  const inputElement = element as HTMLInputElement;
  inputElement.value = content;
  inputElement.closest("form")?.submit();

  await historyManager.updateHistory({
    action,
    querySelector: querySelectorResponse.querySelector,
    summary: await summarizeAction({ action, success: true }),
  });

  return { querySelector: querySelectorResponse.querySelector };
}

export async function takeRefreshAction() {
  const res = await new Promise<void>((resolve) => {
    chrome.runtime.sendMessage({ action: "refresh" }, resolve);
  });

  return res;
}

export async function takeBackAction() {
  const res = await new Promise<void>((resolve) => {
    chrome.runtime.sendMessage({ action: "back" }, resolve);
  });

  return res;
}

async function getQuerySelector({
  screenshot,
  agentIntent,
  history,
  opts,
}: {
  screenshot: string;
  agentIntent: string;
  history: ActionMetadata[];
  opts: {
    updateCursorPosition: (coord: CursorCoordinate) => Promise<void>;
    clickAction: StateMachineInput | null;
    setCursorPosition: React.Dispatch<React.SetStateAction<CursorCoordinate>>;
    setCursorPositionEstimate: React.Dispatch<
      React.SetStateAction<CursorCoordinate>
    >;
  };
}) {
  const elementPosition = await estimateElementLocation({
    userIntent: agentIntent,
    screenshot,
    dimensions: { width: window.innerWidth, height: window.innerHeight },
  });
  if (!elementPosition || !elementPosition.ok) {
    toast.error("unable to estimate element location on screen");
    return;
  }
  const { xEstimate, yEstimate } = elementPosition;

  opts.setCursorPositionEstimate({ x: xEstimate, y: yEstimate });

  const relevantElements = getRelevantElements({
    opts: {
      xEstimate,
      yEstimate,
    },
  });

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

  const { querySelector, boundingRect } = targetElement;

  return {
    querySelector,
    targetX: boundingRect.x,
    targetY: boundingRect.y,
    opts,
  };
}

async function moveToElement({
  querySelector,
  targetX,
  targetY,
  opts,
}: {
  querySelector: string;
  targetX: number;
  targetY: number;
  opts: {
    clickAction: StateMachineInput | null;
    updateCursorPosition: (coord: CursorCoordinate) => Promise<void>;
    setCursorPosition: React.Dispatch<React.SetStateAction<CursorCoordinate>>;
    setCursorPositionEstimate: React.Dispatch<
      React.SetStateAction<CursorCoordinate>
    >;
  };
}): Promise<{ ok: boolean; element: Element | null }> {
  try {
    const target = getClosestElementFromEstimate({
      querySelector,
      targetX,
      targetY,
    });
    if (!target) {
      toast.error("no elements found within the specified radius");
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
        opts.setCursorPosition((prev) => {
          const newX = prev.x + (centerX - prev.x) * 0.3;
          const newY = prev.y + (centerY - prev.y) * 0.3;

          if (Math.abs(newX - centerX) < 1 && Math.abs(newY - centerY) < 1) {
            clearInterval(intervalId);

            // ok to not await
            opts.updateCursorPosition(newCoords);

            const element = document.elementFromPoint(
              centerX,
              centerY,
            ) as HTMLElement;

            timeoutId = setTimeout(() => {
              const events = ["mousedown", "mouseup", "click"];
              opts.clickAction && opts.clickAction.fire();
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

    await sleep(2000); // some buttons take time

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

function getClosestElementFromEstimate({
  querySelector,
  targetX,
  targetY,
}: {
  querySelector: string;
  targetX: number;
  targetY: number;
}) {
  const targets = Array.from(document.querySelectorAll(querySelector));

  const target: Element | null = targets.reduce((closest, current) => {
    const rect = current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.sqrt(
      Math.pow(centerX - targetX, 2) + Math.pow(centerY - targetY, 2),
    );
    if (!closest) {
      return current;
    }

    const closestRect = closest.getBoundingClientRect();
    const closestCenterX = closestRect.left + closestRect.width / 2;
    const closestCenterY = closestRect.top + closestRect.height / 2;
    const closestDistance = Math.sqrt(
      Math.pow(closestCenterX - targetX, 2) +
        Math.pow(closestCenterY - targetY, 2),
    );

    return distance < closestDistance ? current : closest;
  });

  return target;
}

export function printHistory(history: ActionMetadata[]) {
  console.log("---------\n");
  for (const h of history) {
    console.log(`${h.summary}, ${h.querySelector}`);
  }
}

/**
 * 1. what is the success criteria?
 *      loop until success criteria
 * 2. choose an action
 *      take screenshot
 *      decide on an action
 * 3. take action
 *      take screenshot
 *      estimate location
 *      get closest elements
 *      choose query selector
 *      move to element
 */

/**
 * states
 *
 * 1. thinking of success criteria
 * 2. deciding on action
 * 3. action: click "search" button
 * 4. choosing which button to press
 * 5. require user assistance
 */
