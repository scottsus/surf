import { MinifiedElement } from "@repo/types/element";
import { StateMachineInput } from "@rive-app/react-canvas";
import { CursorCoordinate } from "@src/pages/majordomo/provider";
import { toast } from "sonner";

import { summarizeAction } from "../ai/api/summarize-action";
import { minifyDom } from "../dom/minify-dom";
import { ActionMetadata, ActionState } from "../interface/action-metadata";
import { ExtensionState } from "../interface/state";
import { ThinkingState } from "../interface/thinking-state";
import { sleep } from "../utils";
import {
  generateAction,
  takeBackAction,
  takeClickAction,
  takeInputAction,
  takeNavigateAction,
  takeRefreshAction,
} from "./actions";

const MAX_RUN_STEPS = 10;

export async function runUntilCompletion({
  stateManager,
  historyManager,
  setThinkingState,
  cursorOpts,
}: {
  stateManager: {
    loadState: () => Promise<ExtensionState | null>;
    saveState: (state: Partial<ExtensionState>) => Promise<void>;
    clearState: () => Promise<void>;
  };
  historyManager: {
    getLatestAction: () => Promise<ActionMetadata | null | undefined>;
    appendHistory: (newAction: ActionMetadata) => Promise<void | undefined>;
    evaluateHistory: (success: boolean) => Promise<void | undefined>;
  };
  setThinkingState: React.Dispatch<React.SetStateAction<ThinkingState>>;
  cursorOpts: {
    clickAction: StateMachineInput | null;
    updateCursorPosition: (coord: CursorCoordinate) => Promise<void>;
    setCursorPosition: React.Dispatch<React.SetStateAction<CursorCoordinate>>;
    setCursorPositionEstimate: React.Dispatch<
      React.SetStateAction<CursorCoordinate>
    >;
  };
}) {
  const { loadState, clearState } = stateManager;
  const state = await loadState();
  if (!state) {
    toast.info("state is null");
    return;
  }
  const { userIntent, history: unevaluatedHistory } = state;
  const { getLatestAction, appendHistory, evaluateHistory } = historyManager;

  try {
    let i = 0;
    let runInProgress = true;
    let querySelector: string | undefined;
    let runnable: (() => Promise<void>) | undefined;

    while (i < MAX_RUN_STEPS && runInProgress) {
      i += 1;
      setThinkingState({ type: "awaiting_ui_changes" });
      await sleep(500);

      const minifiedElements = minifyDom(document.body);

      const latestAction = await getLatestAction();
      if (latestAction) {
        // @TODO: evaluate the unevaluatedHistory
        const success = true;
        await evaluateHistory(success);
      }

      const updatedState = await loadState();
      if (!updatedState) {
        throw new Error(
          "runUntilCompletion: unable to load state after updating it",
        );
      }
      const { history } = updatedState;
      console.log("history:", history);

      setThinkingState({ type: "deciding_action" });
      const { actions } = await generateAction({
        userIntent,
        minifiedElements,
        history,
      });
      if (actions.length === 0) {
        throw new Error("generateAction: no action generated");
      }
      console.log("actions:", actions);

      for (const action of actions) {
        setThinkingState({ type: "action", action });
        switch (action.type) {
          case "navigate":
            const navigateActionResponse = await takeNavigateAction({
              url: action.url,
            });
            runnable = navigateActionResponse.runnable;
            break;

          case "click":
            setThinkingState({ type: "clicking_button" });
            querySelector = getQuerySelectorFromIndex({
              minifiedElements,
              idx: action.idx,
            });
            if (!querySelector) {
              throw new Error("no query selector found");
            }
            console.log(`document.querySelector("${querySelector}")`);
            const clickActionResponse = await takeClickAction({
              querySelector,
              cursorOpts,
            });
            runnable = clickActionResponse.runnable;
            break;

          case "input":
            setThinkingState({ type: "clicking_button" });
            querySelector = getQuerySelectorFromIndex({
              minifiedElements,
              idx: action.idx,
            });
            if (!querySelector) {
              throw new Error("no query selector found");
            }
            console.log(`document.querySelector("${querySelector}")`);
            const inputActionResponse = await takeInputAction({
              querySelector,
              content: action.content,
              withSubmit: action.withSubmit,
              cursorOpts,
            });
            runnable = inputActionResponse.runnable;
            break;

          case "refresh":
            const refreshActionResponse = await takeRefreshAction();
            runnable = refreshActionResponse.runnable;
            break;

          case "back":
            const backActionResponse = await takeBackAction();
            runnable = backActionResponse.runnable;
            break;

          case "done":
            runnable = undefined;
            await clearState();
            setThinkingState({ type: "done" });
            runInProgress = false;
            break;

          default:
            toast.error("unknown action");
            break;
        }

        /**
         * we do this because a "runnable" has the chance to navigate out of the page
         * resetting the execution context. if there is any cleanup to be done, it should
         * be right before this action.
         */
        if (runnable) {
          await appendHistory({
            action,
            querySelector: "",
            summary: await summarizeAction({ action }),
            state: ActionState.IN_PROGRESS,
          });
          await runnable();
        }

        await sleep(500);
      }
    } // endwhile

    if (i === MAX_RUN_STEPS) {
      setThinkingState({ type: "require_assistance" });
    }
  } catch (err) {
    console.error("runUntilCompletion:", err);
  }
}

function getQuerySelectorFromIndex({
  minifiedElements,
  idx,
}: {
  minifiedElements: MinifiedElement[];
  idx: number;
}) {
  return minifiedElements.find((el) => el.idx === idx)?.meta?.querySelector;
}
