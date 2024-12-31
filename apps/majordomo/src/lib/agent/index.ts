import { CursorCoordinate } from "@src/pages/majordomo/provider";
import { toast } from "sonner";

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
import { HistoryManager } from "./history-manager";

const MAX_RUN_STEPS = 10;

export async function runUntilCompletion({
  extensionState,
  historyManager,
  opts,
}: {
  extensionState: ExtensionState;
  historyManager: HistoryManager;
  opts: {
    checkAbortSignal: () => Promise<boolean>;
    clearState: () => Promise<void>;
    setThinkingState: React.Dispatch<React.SetStateAction<ThinkingState>>;
    updateCursorPosition: (coord: CursorCoordinate) => Promise<void>;
    setCursorPosition: React.Dispatch<React.SetStateAction<CursorCoordinate>>;
    setCursorPositionEstimate: React.Dispatch<
      React.SetStateAction<CursorCoordinate>
    >;
  };
}) {
  const { userIntent } = extensionState;
  const {
    checkAbortSignal,
    clearState,
    setThinkingState,
    updateCursorPosition,
    setCursorPosition,
    setCursorPositionEstimate,
  } = opts;

  try {
    let i = 0;
    let runInProgress = true;
    while (i < MAX_RUN_STEPS && runInProgress) {
      i += 1;
      setThinkingState({ type: "awaiting_ui_changes" });
      await sleep(1500);

      const abort = await checkAbortSignal();
      if (abort) {
        await clearState();
        setThinkingState({ type: "aborted" });
        runInProgress = false; // extra redundancy
        break;
      }

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

      setThinkingState({ type: "deciding_action" });
      const { action } = await generateAction({
        screenshot,
        userIntent,
        history: historyManager.getLocalHistory(),
      });
      if (!action) {
        toast.error("no action was chosen");
        continue;
      }

      setThinkingState({ type: "action", action });
      switch (action.type) {
        case "navigate":
          await takeNavigateAction({
            url: action.url,
            action,
            historyManager,
          });
          break;

        case "click":
          await takeClickAction({
            screenshot,
            agentIntent: action.buttonDescription,
            action,
            historyManager,
            opts: {
              setThinkingState,
              updateCursorPosition,
              setCursorPosition,
              setCursorPositionEstimate,
            },
          });
          break;

        case "input":
          await takeInputAction({
            screenshot,
            inputDescription: action.inputDescription,
            content: action.content,
            action,
            historyManager,
            opts: {
              setThinkingState,
              updateCursorPosition,
              setCursorPosition,
              setCursorPositionEstimate,
            },
          });
          break;

        case "refresh":
          takeRefreshAction();
          break;

        case "back":
          takeBackAction();
          break;

        case "done":
          // @TODO insert some done animation
          await clearState();
          setThinkingState({ type: "done" });
          runInProgress = false;
          break;

        default:
          toast.error("unknown action");
          break;
      }
    } // endwhile

    if (i === MAX_RUN_STEPS) {
      setThinkingState({ type: "require_assistance" });
    }
  } catch (err) {
    console.error("runUntilCompletion:", err);
  }
}
