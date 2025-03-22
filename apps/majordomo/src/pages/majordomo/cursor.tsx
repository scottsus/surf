import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { ShinyText } from "@src/components/shiny-text";
import { USE_RIVE } from "@src/lib/env";
import { stringifyThinkingState } from "@src/lib/interface/thinking-state";
import { useCallback, useEffect, useState } from "react";

import { ClarifyInput } from "./clarify";
import { Markdown } from "./markdown";
import { useMajordomo } from "./provider";
import { TakeOver } from "./take-over";

const IS_TESTING_UI = import.meta.env.DEV && false;

export function Cursor() {
  const { setPerformClick, thinkingState, setThinkingState, cursorPosition } =
    useMajordomo();

  const [isClicking, setIsClicking] = useState(false);
  const [maxHeight, setMaxHeight] = useState<number>();

  const { rive, RiveComponent } = useRive({
    src: chrome.runtime.getURL("/rive/cursor.riv"),
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
    const calculateMaxHeight = () => {
      const windowHeight = window.innerHeight;
      const cursorY = cursorPosition.y;

      const PADDING = 40;
      const availableHeight = windowHeight - cursorY - PADDING;
      setMaxHeight(availableHeight > 0 ? availableHeight : undefined);
    };

    calculateMaxHeight();
    window.addEventListener("resize", calculateMaxHeight);

    return () => {
      window.removeEventListener("resize", calculateMaxHeight);
    };
  }, [cursorPosition.y]);

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
              transition: "all 0.05s",
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
        <div
          className="hide-scrollbar rounded-xl"
          style={{
            marginTop: "0.6em",
            padding: "0 0.75em",
            border: "3px solid white",
            backgroundColor: "#060606",
            fontSize: "18px",
            maxHeight: maxHeight,
            overflowY: maxHeight ? "scroll" : "visible",
            pointerEvents: "all",
            color: "white",
          }}
        >
          {(thinkingState.type === "action" &&
            (thinkingState.action.type === "clarify" ||
              thinkingState.action.type === "done")) ||
          thinkingState.type === "done" ? (
            <Markdown content={stringify()} />
          ) : (
            <ShinyText text={stringify()} />
          )}
        </div>

        <ClarifyInput />
      </div>

      <TakeOver
        show={
          !(
            thinkingState.type === "action" &&
            thinkingState.action.type === "clarify"
          ) &&
          !(
            thinkingState.type === "action" &&
            thinkingState.action.type === "done"
          ) &&
          !(thinkingState.type === "error")
        }
      />
    </div>
  );
}
