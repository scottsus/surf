import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { runUntilCompletion } from "@src/lib/agent";
import { HistoryManager } from "@src/lib/agent/history-manager";
import { ActionMetadata } from "@src/lib/interface/action-metadata";
import { ExtensionState } from "@src/lib/interface/state";
import { ThinkingState } from "@src/lib/interface/thinking-state";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export type CursorCoordinate = {
  x: number;
  y: number;
};

type MajordomoContextType = {
  extensionState: ExtensionState;
  clearState: () => Promise<void>;

  thinkingState: ThinkingState;
  setThinkingState: React.Dispatch<React.SetStateAction<ThinkingState>>;

  setUserIntent: (intent: string) => Promise<void>;
  updateCursorPosition: (coord: CursorCoordinate) => Promise<void>;

  historyManager: HistoryManager;

  RiveComponent: (props: React.ComponentProps<"canvas">) => JSX.Element;

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
  // State
  const initialExtensionState: ExtensionState = {
    userIntent: "",
    history: [],
    cursorPosition: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    abort: false,
  };
  const [extensionState, setExtensionState] = useState<ExtensionState>(
    initialExtensionState,
  );
  const [thinkingState, setThinkingState] = useState<ThinkingState>({
    type: "idle",
  });
  const historyManager = HistoryManager.getInstance({ appendHistory });

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
  const [cursorPosition, setCursorPosition] = useState<CursorCoordinate>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const [cursorPositionEstimate, setCursorPositionEstimate] =
    useState<CursorCoordinate>({
      x: 0,
      y: 0,
    });

  /**
   * sync on purpose as part of useEffect
   */
  function loadState() {
    chrome.runtime.sendMessage(
      { action: "load_state" },
      (ext: ExtensionState | null) => {
        if (ext) {
          setExtensionState(ext);
          setCursorPosition(ext.cursorPosition);
          historyManager.loadHistory(ext.history);
        }
      },
    );
  }

  /**
   * async on purpose as part of runUntilCompletion
   */
  async function saveState(extensionState: ExtensionState) {
    return await new Promise<void>((resolve) => {
      chrome.runtime.sendMessage(
        { action: "save_state", state: extensionState },
        resolve,
      );
    });
  }

  /**
   * async on purpose as part of runUntilCompletion
   */
  async function clearState() {
    setExtensionState(initialExtensionState);
    return await new Promise<void>((resolve) => {
      chrome.runtime.sendMessage({ action: "clear_state" }, resolve);
    });
  }

  async function setUserIntent(intent: string) {
    const newState: ExtensionState = {
      ...extensionState,
      userIntent: intent,
    };
    setExtensionState(newState);
    await saveState(newState);
  }

  /**
   * because we're passing this into history manager, the `extensionState`
   * is inherently frozen, which is why we need this workaround.
   */
  async function appendHistory(newAction: ActionMetadata) {
    const newState = await new Promise<ExtensionState>((resolve) => {
      setExtensionState((currentState) => {
        const newState = {
          ...currentState,
          history: [...currentState.history, newAction],
        };
        resolve(newState);
        return newState;
      });
    });
    await saveState(newState);
  }

  async function updateCursorPosition({ x, y }: CursorCoordinate) {
    const newState: ExtensionState = {
      ...extensionState,
      cursorPosition: { x, y },
    };
    setExtensionState(newState);
    await saveState(newState);
  }

  /**
   * the `extensionState` we're passing into `runUntilCompletion` is frozen,
   * so we need this workaround
   */
  async function checkAbortSignal() {
    return await new Promise<boolean>((resolve) => {
      setExtensionState((currentState) => {
        resolve(currentState.abort);
        return currentState;
      });
    });
  }

  async function abort() {
    return await new Promise<void>((resolve) => {
      chrome.runtime.sendMessage({ action: "abort" }, resolve);
    });
  }

  useEffect(() => {
    const { userIntent } = extensionState;
    if (!userIntent) {
      return;
    }
    console.log("Objective:", userIntent);

    runUntilCompletion({
      extensionState,
      historyManager,
      opts: {
        clearState,
        setThinkingState,
        clickAction,
        updateCursorPosition,
        setCursorPosition,
        setCursorPositionEstimate,
      },
    });
  }, [extensionState.userIntent]);

  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "c") {
        e.preventDefault();
        toast.info("❌ cancelling current task...");
        await clearState();
        await abort();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <MajordomoContext.Provider
      value={{
        extensionState,
        clearState,
        thinkingState,
        setThinkingState,
        setUserIntent,
        historyManager,
        RiveComponent,
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
