import { MinifiedElement } from "@repo/types";
import { CursorCoordinate } from "@src/pages/majordomo/provider";
import { MutableRefObject } from "react";
import { toast } from "sonner";

import { evaluateActions } from "../ai/api/evaluate-actions";
import { summarizeAction } from "../ai/api/summarize-action";
import { minifyDom } from "../dom/minify-dom";
import { IS_DEBUGGING, USE_AI_EVALS_FOR_PREV_ACTIONS } from "../env";
import { ActionMetadata, ActionState } from "../interface/action-metadata";
import { ExtensionState } from "../interface/state";
import { ThinkingState } from "../interface/thinking-state";
import { sleep } from "../utils";
import {
  generateAction,
  takeBackAction,
  takeClarifyAction,
  takeClickAction,
  takeInputAction,
  takeNavigateAction,
  takeRefreshAction,
} from "./actions";

const MAX_RUN_STEPS = 3;

export async function runUntilCompletion({
  stateManager,
  historyManager,
  setThinkingState,
  clarifyInputRef,
  overlayBlurRef,
  cursorOpts,
}: {
  stateManager: {
    loadState: () => Promise<ExtensionState | null>;
    saveState: (state: Partial<ExtensionState>) => Promise<void>;
    clearState: () => Promise<void>;
  };
  historyManager: {
    getLatestActions: () => Promise<ActionMetadata[] | null | undefined>;
    appendHistory: ({
      step,
      action,
    }: {
      step: number;
      action: ActionMetadata;
    }) => Promise<void>;
    incrStep: () => void;
    applyEvaluations: ({
      evaluation,
    }: {
      evaluation: boolean[];
    }) => Promise<void>;
  };
  setThinkingState: React.Dispatch<React.SetStateAction<ThinkingState>>;
  clarifyInputRef: MutableRefObject<(() => Promise<string>) | null>;
  overlayBlurRef: MutableRefObject<((blur: boolean) => void) | null>;
  cursorOpts: {
    performClickRef: MutableRefObject<(() => void) | null>;
    updateCursorPosition: (coord: CursorCoordinate) => Promise<void>;
    setCursorPosition: React.Dispatch<React.SetStateAction<CursorCoordinate>>;
  };
}) {
  const { loadState, clearState } = stateManager;
  const state = await loadState();
  if (!state) {
    toast.info("state is null");
    return;
  }
  const { userIntent } = state;
  const { getLatestActions, appendHistory, applyEvaluations, incrStep } =
    historyManager;

  try {
    let i = 0;
    let runInProgress = true;
    let querySelector: string | undefined;
    let runnable: (() => Promise<any>) | undefined;

    while (i < MAX_RUN_STEPS && runInProgress) {
      i += 1;
      setThinkingState({ type: "awaiting_ui_changes" });
      await sleep(500);

      const minifiedElements = minifyDom(document.body);

      const latestActions = await getLatestActions();
      if (latestActions) {
        let evaluation = Array(latestActions.length).fill(true);
        if (USE_AI_EVALS_FOR_PREV_ACTIONS) {
          evaluation = await evaluateActions({
            latestActions,
            minifiedElements,
          });
        }
        applyEvaluations({ evaluation });
      }

      const updatedState = await loadState();
      if (!updatedState) {
        throw new Error(
          "runUntilCompletion: unable to load state after updating it",
        );
      }
      const { history } = updatedState;
      console.log("History:", history);

      setThinkingState({ type: "deciding_action" });
      const actions = await generateAction({
        userIntent,
        minifiedElements,
        history,
      });
      if (actions.length === 0) {
        throw new Error("generateAction: no action generated");
      }
      console.log("Actions:", actions);

      for (const action of actions) {
        setThinkingState({ type: "action", action });
        switch (action.type) {
          case "navigate":
            const navigateActionResponse = await takeNavigateAction({
              url: action.url,
            });
            runnable = navigateActionResponse.runnable;
            break;

          case "clarify":
            const clarifyActionResponse = await takeClarifyAction({
              clarifyInputRef,
              overlayBlurRef,
            });
            runnable = clarifyActionResponse.runnable;
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
          let userClarification = "";
          const res = await runnable();
          if (res?.userClarification) {
            userClarification = res.userClarification;
          }
          await appendHistory({
            step: updatedState.step,
            action: {
              action,
              querySelector: "",
              summary: await summarizeAction({
                action,
                userInput: userClarification,
              }),
              state: ActionState.IN_PROGRESS,
            },
          });
          incrStep();
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
  const querySelector = minifiedElements.find((el) => el.idx === idx)?.meta
    ?.querySelector;
  if (IS_DEBUGGING) {
    console.log(`document.querySelector("${querySelector}")`);
  }

  return querySelector;
}
