import { stringify } from "@src/lib/interface/action";
import { useCallback, useEffect } from "react";

import { useMajordomo } from "./provider";

const IS_TESTING = process.env.NODE_ENV === "development" && false;

export function Cursor() {
  const {
    RiveComponent,
    thinkingState,
    setThinkingState,
    cursorPosition,
    cursorPositionEstimate,
  } = useMajordomo();

  const stringifyThinkingState = useCallback(() => {
    switch (thinkingState.type) {
      case "idle":
        return "ready";
      case "awaiting_ui_changes":
        return "awaiting UI changes...";
      case "deciding_action":
        return "deciding on next action...";
      case "action":
        return stringify(thinkingState.action);
      case "clicking_button":
        return "choosing the right button...";
      case "require_assistance":
        return "unable to complete task - require assistance";
      case "aborted":
        return "aborted!";
      case "done":
        return "done!";
    }
  }, [thinkingState]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (
      thinkingState.type === "require_assistance" ||
      thinkingState.type === "aborted" ||
      thinkingState.type === "done"
    ) {
      timeoutId = setTimeout(() => {
        setThinkingState({ type: "idle" });
      }, 2000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [thinkingState]);

  return (
    <div className="z-[2147483647]">
      <div
        className="absolute"
        style={{
          left: cursorPosition.x - 60,
          top: cursorPosition.y - 40,
          display: thinkingState.type !== "idle" ? "block" : "none",
          zIndex: 2147483647,
        }}
      >
        <RiveComponent
          // @TODO: not working with some websites like LinkedIn
          id="rivecursor"
          style={{ width: "8rem", height: "8rem" }}
        />
      </div>
      <div
        className="fixed flex items-center rounded-md"
        style={{
          backgroundColor: "#5B7EFF",
          left: cursorPosition.x + 45,
          top: cursorPosition.y + 10,
          padding: "0.5em 0.75em",
          border: "2px solid #4D6CDB",
          display: thinkingState.type !== "idle" ? "block" : "none",
        }}
      >
        <p className="text-white" style={{ margin: 0 }}>
          {stringifyThinkingState()}
        </p>
      </div>
      {IS_TESTING && (
        <div
          style={{
            left: cursorPositionEstimate.x,
            top: cursorPositionEstimate.y,
          }}
          className="pointer-events-none fixed z-50 h-[400px] w-[400px] rounded-full bg-blue-500 opacity-30"
        />
      )}
    </div>
  );
}
