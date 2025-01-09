import { StateMachineInput } from "@rive-app/react-canvas";
import { CursorCoordinate } from "@src/pages/majordomo/provider";
import { toast } from "sonner";

import { summarizeAction } from "../ai/api/summarize-action";
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
  takeScreenshot,
} from "./actions";

const MAX_RUN_STEPS = 10;

export async function runUntilCompletion({
  stateManager,
  historyManager,
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
  cursorOpts: {
    setThinkingState: React.Dispatch<React.SetStateAction<ThinkingState>>;
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
  const {
    setThinkingState,
    clickAction,
    updateCursorPosition,
    setCursorPosition,
    setCursorPositionEstimate,
  } = cursorOpts;

  try {
    let i = 0;
    let runInProgress = true;
    let runnable: (() => Promise<void>) | undefined;

    while (i < MAX_RUN_STEPS && runInProgress) {
      i += 1;
      setThinkingState({ type: "awaiting_ui_changes" });
      await sleep(500);

      const { ok, screenshot } = await takeScreenshot();
      if (!ok) {
        toast.error(
          "unable to take screenshot - please adjust your screen size and try again",
        );
        await clearState();
        setThinkingState({ type: "aborted" });
        runInProgress = false; // extra redundancy
        break;
      }

      const latestAction = await getLatestAction();
      if (latestAction) {
        // evaluate the unevaluatedHistory
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
      const { action } = await generateAction({
        screenshot,
        userIntent,
        history,
      });
      if (!action) {
        toast.error("no action was chosen");
        continue;
      }
      console.log("action:", action);

      setThinkingState({ type: "action", action });
      switch (action.type) {
        case "navigate":
          const navigateActionResponse = await takeNavigateAction({
            url: action.url,
          });
          runnable = navigateActionResponse.runnable;
          break;

        case "click":
          const clickActionResponse = await takeClickAction({
            agentIntent: `aria-label: ${action.ariaLabel}, description: ${action.targetDescription}`,
            history,
            setThinkingState,
            cursorOpts: {
              clickAction,
              updateCursorPosition,
              setCursorPosition,
              setCursorPositionEstimate,
            },
          });
          runnable = clickActionResponse.runnable;
          break;

        case "input":
          const inputActionResponse = await takeInputAction({
            inputDescription: `aria-label: ${action.ariaLabel}, description: ${action.targetDescription}`,
            content: action.content,
            action,
            history,
            setThinkingState,
            cursorOpts: {
              clickAction,
              updateCursorPosition,
              setCursorPosition,
              setCursorPositionEstimate,
            },
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

      if (runnable) {
        await appendHistory({
          action,
          querySelector: "",
          summary: await summarizeAction({ action }),
          state: ActionState.IN_PROGRESS,
        });
        await runnable();
      }
    } // endwhile

    if (i === MAX_RUN_STEPS) {
      setThinkingState({ type: "require_assistance" });
    }
  } catch (err) {
    console.error("runUntilCompletion:", err);
  }
}
