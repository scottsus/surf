import { USE_RIVE } from "@src/lib/env";
import { stringify } from "@src/lib/interface/action";
import { useCallback, useEffect } from "react";

import { useMajordomo } from "./provider";

const IS_TESTING_UI = process.env.NODE_ENV === "development" && false;

export function Cursor() {
  const {
    isClicking,
    RiveComponent,
    thinkingState,
    setThinkingState,
    cursorPosition,
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
        // @TODO: need to sync with `actions.ts`
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
          left: cursorPosition.x,
          top: cursorPosition.y,
          display:
            IS_TESTING_UI || thinkingState.type !== "idle" ? "block" : "none",
          zIndex: 2147483647,
        }}
      >
        {USE_RIVE ? (
          <RiveComponent
            /**
             * @TODO: not working with certain websites
             * CORS prevent fetching wasm files from CDN
             */
            id="rivecursor"
            style={{ width: "8rem", height: "8rem" }}
          />
        ) : (
          <img
            src={chrome.runtime.getURL("/cursor.svg")}
            width={60}
            height={60}
            style={{
              // left: cursorPosition.x,
              // top: cursorPosition.y - 5,
              transition: "all 0.2s",
              transform: isClicking
                ? "translate(-10px, -10px) scale(0.85)"
                : "none",
            }}
            alt="" // intentionally blank
          />
        )}
      </div>

      <div
        className="fixed flex items-center rounded-md"
        style={{
          backgroundColor: "#5B7EFF",
          left: cursorPosition.x + 70,
          top: cursorPosition.y + 20,
          padding: "0.5em 0.75em",
          border: "2px solid #4D6CDB",
          display:
            IS_TESTING_UI || thinkingState.type !== "idle" ? "block" : "none",
        }}
      >
        <p className="text-white" style={{ margin: 0 }}>
          {stringifyThinkingState()}
        </p>
      </div>
    </div>
  );
}
