import { useEffect, useRef, useState } from "react";
import { MutatingDots } from "react-loader-spinner";

import { useMajordomo } from "./provider";

export enum TakeOverState {
  IDLE,
  WAITING_TO_START,
  IN_PROGRESS,
}

export function TakeOver({ show }: { show: boolean }) {
  const { checkTakeOverRef, setTakeOverRef, setTakeOverStateRef } =
    useMajordomo();
  const [takeOverState, setTakeOverState] = useState<TakeOverState>(
    TakeOverState.IDLE,
  );
  const buttonRef = useRef<HTMLButtonElement>(null);

  const onClick = () => {
    if (takeOverState === TakeOverState.IDLE) {
      checkTakeOverRef.current = true;
      setTakeOverState(TakeOverState.WAITING_TO_START);
    } else if (takeOverState === TakeOverState.WAITING_TO_START) {
      // button should be disabled here
      // ignore
    } else {
      checkTakeOverRef.current = false;
      setTakeOverState(TakeOverState.IDLE);
    }
  };

  async function takeOver() {
    await new Promise<void>((resolve) => {
      const onClick = () => {
        resolve();
      };

      const button = buttonRef.current;
      if (button) {
        button.addEventListener("click", onClick);
      }

      return () => {
        button && button.removeEventListener("click", onClick);
      };
    });
  }

  useEffect(() => {
    setTakeOverStateRef.current = setTakeOverState;
    setTakeOverRef(takeOver);
  }, []);

  return (
    <div style={{ zIndex: 2147483647 }}>
      {takeOverState === TakeOverState.WAITING_TO_START && (
        <div
          className="flex items-center justify-center"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "white",
            opacity: 0.8,
          }}
        >
          <MutatingDots color="black" secondaryColor="black" />
        </div>
      )}
      <button
        onClick={onClick}
        ref={buttonRef}
        className="rounded-full transition-all"
        style={{
          position: "fixed",
          bottom: "10vh",
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "auto",
          backgroundColor: "white",
          padding: "0.5rem 1.5rem",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 0 10px 0px rgb(91, 126, 255)",
          display: show ? "block" : "none",
        }}
        disabled={takeOverState === TakeOverState.WAITING_TO_START}
      >
        <p style={{ color: "black", margin: 0, fontSize: "18px" }}>
          {takeOverState === TakeOverState.IDLE
            ? "Take Control"
            : takeOverState === TakeOverState.WAITING_TO_START
              ? "Waiting..."
              : "Return Control"}
        </p>
      </button>
    </div>
  );
}
