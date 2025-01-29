import { runUntilCompletion } from "@src/lib/agent";
import { summarizeAction } from "@src/lib/ai/api/summarize-action";
import { ActionMetadata } from "@src/lib/interface/action-metadata";
import { ExtensionState } from "@src/lib/interface/state";
import { ThinkingState } from "@src/lib/interface/thinking-state";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export type CursorCoordinate = {
  x: number;
  y: number;
};

type MajordomoContextType = {
  currentTabIsWorking: () => Promise<boolean>;

  loadState: () => Promise<ExtensionState | null>;
  clearState: () => Promise<void>;

  stateTrigger: boolean;

  thinkingState: ThinkingState;
  setThinkingState: React.Dispatch<React.SetStateAction<ThinkingState>>;

  setUserIntent: (intent: string) => Promise<void>;
  updateCursorPosition: (coord: CursorCoordinate) => Promise<void>;

  setClarifyInput: (fn: () => Promise<string>) => void;

  setOverlayExit: (fn: () => Promise<void>) => void;
  setOverlayBlur: (fn: (blur: boolean) => void) => void;

  setPerformClick: (fn: () => void) => void;
  cursorPosition: CursorCoordinate;
  setCursorPosition: React.Dispatch<React.SetStateAction<CursorCoordinate>>;
};

const MajordomoContext = createContext<MajordomoContextType | undefined>(
  undefined,
);

export function MajordomoProvider({ children }: { children: React.ReactNode }) {
  // Thinking states
  const [stateTrigger, setStateTrigger] = useState(false);
  const [thinkingState, setThinkingState] = useState<ThinkingState>({
    type: "idle",
  });

  // Clarify
  const clarifyInputRef = useRef<(() => Promise<string>) | null>(null);
  const setClarifyInput = (fn: () => Promise<string>) => {
    clarifyInputRef.current = fn;
  };

  // Overlay
  const overlayBlurRef = useRef<((blur: boolean) => void) | null>(null);
  const setOverlayBlur = (fn: (blur: boolean) => void) => {
    overlayBlurRef.current = fn;
  };
  const overlayExitRef = useRef<(() => Promise<void>) | null>(null);
  const setOverlayExit = (fn: () => Promise<void>) => {
    overlayExitRef.current = fn;
  };

  // Cursor
  const performClickRef = useRef<(() => void) | null>(null);
  const setPerformClick = (fn: () => void) => {
    performClickRef.current = fn;
  };
  const [cursorPosition, setCursorPosition] = useState<CursorCoordinate>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  async function loadState(): Promise<ExtensionState | null> {
    return await new Promise<ExtensionState | null>((resolve) => {
      chrome.runtime.sendMessage(
        { action: "load_state" },
        (ext: ExtensionState | null) => {
          resolve(ext);
        },
      );
    });
  }

  async function saveState(extensionState: Partial<ExtensionState>) {
    return await new Promise<void>((resolve) => {
      chrome.runtime.sendMessage(
        { action: "save_state", state: extensionState },
        resolve,
      );
    });
  }

  async function clearState() {
    const safeExit = overlayExitRef.current;
    if (safeExit) {
      await safeExit();
    }
    setStateTrigger((t) => !t);
    return await new Promise<void>((resolve) => {
      chrome.runtime.sendMessage({ action: "clear_state" }, resolve);
    });
  }

  async function getCurrentTabId(): Promise<number> {
    const currentTab = await new Promise<{ id: number }>((resolve) => {
      chrome.runtime.sendMessage({ action: "get_tab_id" }, resolve);
    });

    return currentTab?.id;
  }

  async function currentTabIsWorking() {
    const currentTabId = await getCurrentTabId();
    const extState = await loadState();

    return currentTabId === extState?.workingTabId;
  }

  async function setUserIntent(intent: string) {
    await saveState({ userIntent: intent });
    setStateTrigger((t) => !t);
  }

  async function updateUserIntent(intent: string) {
    const existingState = await loadState();
    if (!existingState) {
      throw new Error("updateUserIntent: existings state is null");
    }
    const { userIntent } = existingState;
    const updatedIntent = userIntent + `User clarification: "${intent}"`;
    await saveState({ ...existingState, userIntent: updatedIntent });
  }

  async function incrStep() {
    const existingState = await loadState();
    if (!existingState) {
      throw new Error("incrStep: existing state is null");
    }
    const { step } = existingState;
    await saveState({ ...existingState, step: step + 1 });
  }

  async function getLatestActions() {
    const existingState = await loadState();
    if (!existingState) {
      throw new Error("getLatestAction: existing state is null");
    }
    const { history } = existingState;
    return history[history.length - 1];
  }

  async function appendHistory({
    step,
    action,
  }: {
    step: number;
    action: ActionMetadata;
  }) {
    const existingState = await loadState();
    if (!existingState) {
      throw new Error("appendHistory: existing state is null");
    }
    const latestActions = existingState.history[step] ?? [];
    latestActions.push(action);

    await saveState({
      history: [...existingState.history.slice(0, step), latestActions],
    });
  }

  async function applyEvaluations({ evaluation }: { evaluation: boolean[] }) {
    const existingState = await loadState();
    if (!existingState) {
      throw new Error("evaluateHistory: existing state is null");
    }
    const { history } = existingState;
    if (history.length === 0) {
      return;
    }
    const latestActions = history[history.length - 1];
    if (!latestActions) {
      console.error("latestActions is undefined");
      return;
    }
    if (
      evaluation.length === 0 ||
      latestActions.length === 0 ||
      evaluation.length !== latestActions.length
    ) {
      console.error(
        `applyEvaluations: evaluations.length [${evaluation.length}], latestActions.length [${latestActions.length}]`,
      );
      return;
    }
    const evaluatedActions: ActionMetadata[] = [];
    for (let i = 0; i < evaluation.length; i++) {
      const unevaluatedAction = latestActions[i];
      if (!unevaluatedAction) {
        continue;
      }

      const action = unevaluatedAction.action;
      let evaluatedAction: ActionMetadata = unevaluatedAction;
      if (action.type !== "clarify") {
        const evaluatedSummary = await summarizeAction({
          action: unevaluatedAction.action,
          success: evaluation[i],
        });
        evaluatedAction = {
          ...unevaluatedAction,
          summary: evaluatedSummary,
        };
      }

      evaluatedActions.push(evaluatedAction);
    }
    const newHistory = [
      ...history.slice(0, history.length - 1),
      evaluatedActions,
    ];
    await saveState({ history: newHistory });
  }

  async function updateCursorPosition(newCoordinates: CursorCoordinate) {
    await saveState({ cursorPosition: newCoordinates });
  }

  async function abort() {
    return await new Promise<void>((resolve) => {
      chrome.runtime.sendMessage({ action: "abort" }, resolve);
    });
  }

  useEffect(() => {
    loadState().then(async (ext) => {
      if (!ext) {
        throw new Error("provider.useEffect: extensionState is null");
      }

      const { workingTabId, userIntent } = ext;
      const currentTabId = await getCurrentTabId();
      if (currentTabId !== workingTabId) {
        return;
      }
      if (!userIntent) {
        return;
      }
      console.log("Surf objective:", userIntent);

      runUntilCompletion({
        stateManager: {
          loadState,
          saveState,
          clearState,
        },
        historyManager: {
          getLatestActions,
          appendHistory,
          applyEvaluations,
          incrStep,
        },
        setThinkingState,
        clarifyInputRef,
        overlayBlurRef,
        cursorOpts: {
          performClickRef,
          updateCursorPosition,
          setCursorPosition,
        },
      });
    });
  }, [stateTrigger]);

  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "c") {
        e.preventDefault();
        toast.info("❌ cancelling current task...");
        await abort();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <MajordomoContext.Provider
      value={{
        currentTabIsWorking,
        loadState,
        clearState,
        stateTrigger,
        thinkingState,
        setThinkingState,
        setUserIntent,
        setClarifyInput,
        setOverlayBlur,
        setOverlayExit,
        setPerformClick,
        updateCursorPosition,
        cursorPosition,
        setCursorPosition,
      }}
    >
      {children}
    </MajordomoContext.Provider>
  );
}

export function useMajordomo() {
  const context = useContext(MajordomoContext);
  if (context === undefined) {
    throw new Error("useMajordomo must be used within a MajordomoProvider");
  }

  return context;
}
