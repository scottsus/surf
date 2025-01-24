import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { runUntilCompletion } from "@src/lib/agent";
import { summarizeAction } from "@src/lib/ai/api/summarize-action";
import { ActionMetadata } from "@src/lib/interface/action-metadata";
import { ExtensionState } from "@src/lib/interface/state";
import { ThinkingState } from "@src/lib/interface/thinking-state";
import { sleep } from "@src/lib/utils";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

import { OverlayState } from "./overlay";

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

  overlayState: OverlayState;
  setOverlayState: React.Dispatch<React.SetStateAction<OverlayState>>;

  RiveComponent: (props: React.ComponentProps<"canvas">) => JSX.Element;

  isClicking: boolean;
  cursorPosition: CursorCoordinate;
  setCursorPosition: React.Dispatch<React.SetStateAction<CursorCoordinate>>;
  cursorPositionEstimate: CursorCoordinate;
  setCursorPositionEstimate: React.Dispatch<
    React.SetStateAction<CursorCoordinate>
  >;
};

const MajordomoContext = createContext<MajordomoContextType | undefined>(
  undefined,
);

export function MajordomoProvider({ children }: { children: React.ReactNode }) {
  const [stateTrigger, setStateTrigger] = useState(false);

  const [thinkingState, setThinkingState] = useState<ThinkingState>({
    type: "idle",
  });

  // Overlay
  const [overlayState, setOverlayState] = useState<OverlayState>(
    OverlayState.IDLE,
  );

  // Cursor
  const { rive, RiveComponent } = useRive({
    src: chrome.runtime.getURL("/cursor.riv"),
    stateMachines: "State Machine",
    autoplay: true,
  });
  const clickAction = useStateMachineInput(
    rive,
    "State Machine",
    "Click",
    true,
  );
  const [isClicking, setIsClicking] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<CursorCoordinate>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const [cursorPositionEstimate, setCursorPositionEstimate] =
    useState<CursorCoordinate>({
      x: 0,
      y: 0,
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
    await safeExit();
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

  async function getLatestAction() {
    const existingState = await loadState();
    if (!existingState) {
      throw new Error("getLatestAction: existing state is null");
    }
    const { history } = existingState;
    if (history.length === 0) {
      return null;
    }
    return history[history.length - 1];
  }

  async function appendHistory(newAction: ActionMetadata) {
    const existingState = await loadState();
    if (!existingState) {
      throw new Error("appendHistory: existing state is null");
    }
    await saveState({ history: [...existingState.history, newAction] });
  }

  async function evaluateHistory(success: boolean) {
    const existingState = await loadState();
    if (!existingState) {
      throw new Error("evaluateHistory: existing state is null");
    }
    const { history } = existingState;
    if (history.length === 0) {
      return;
    }
    const latestAction = history[history.length - 1];
    if (!latestAction) {
      return;
    }
    latestAction.summary = await summarizeAction({
      action: latestAction.action,
      success,
    });
    const newHistory = [...history.slice(0, history.length - 1), latestAction];
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

  async function safeExit() {
    setOverlayState(OverlayState.EXITING);
    await sleep(1500);
  }

  function performClick() {
    setIsClicking(true);
    const timeoutId = setTimeout(() => {
      setIsClicking(false);
    }, 150);

    return () => clearTimeout(timeoutId);
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
          getLatestAction,
          appendHistory,
          evaluateHistory,
        },
        setThinkingState,
        cursorOpts: {
          clickAction,
          performClick,
          updateCursorPosition,
          setCursorPosition,
          setCursorPositionEstimate,
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
        overlayState,
        setOverlayState,
        RiveComponent,
        isClicking,
        updateCursorPosition,
        cursorPosition,
        setCursorPosition,
        cursorPositionEstimate,
        setCursorPositionEstimate,
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
