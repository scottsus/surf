import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { USE_RIVE } from "@src/lib/env";
import { stringifyThinkingState } from "@src/lib/interface/thinking-state";
import { useCallback, useEffect, useState } from "react";

import { ClarifyInput } from "./clarify";
import { useMajordomo } from "./provider";
import { TakeOver } from "./take-over";

const IS_TESTING_UI = import.meta.env.DEV && false;

export function Cursor() {
  const { setPerformClick, thinkingState, setThinkingState, cursorPosition } =
    useMajordomo();

  const [isClicking, setIsClicking] = useState(false);

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

  const stringify = useCallback(() => {
    return stringifyThinkingState(thinkingState);
  }, [thinkingState]);

  function performClick() {
    let timeoutId: NodeJS.Timeout;
    if (USE_RIVE) {
      clickAction && clickAction.fire();
    } else {
      setIsClicking(true);
      timeoutId = setTimeout(() => {
        setIsClicking(false);
      }, 150);
    }

    return () => clearTimeout(timeoutId);
  }

  useEffect(() => {
    setPerformClick(performClick);
  }, []);

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
    <div
      style={{
        display:
          IS_TESTING_UI || thinkingState.type !== "idle" ? "block" : "none",
        zIndex: 214748364,
      }}
    >
      <div
        className="absolute"
        style={{
          left: cursorPosition.x,
          top: cursorPosition.y,
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
              transition: "all 0.2s",
              transform: isClicking
                ? "translate(-10px, -10px) scale(0.85)"
                : "none",
            }}
            alt="Surf cursor"
          />
        )}
      </div>

      <div
        className="fixed flex-col items-center"
        style={{
          left: cursorPosition.x + 70,
          top: cursorPosition.y,
          maxWidth: "30rem",
          display:
            IS_TESTING_UI || thinkingState.type !== "idle" ? "flex" : "none",
          rowGap: "0.75rem",
        }}
      >
        <p
          className="rounded-xl text-white"
          style={{
            margin: 0,
            padding: "0.5em 0.75em",
            border: "2px solid #4D6CDB",
            backgroundColor: "#5B7EFF",
            fontSize: "18px",
          }}
        >
          {stringify()}
        </p>

        <ClarifyInput />
      </div>

      <TakeOver
        show={
          !(
            thinkingState.type === "action" &&
            thinkingState.action.type === "clarify"
          ) && !(thinkingState.type === "error")
        }
      />
    </div>
  );
}
