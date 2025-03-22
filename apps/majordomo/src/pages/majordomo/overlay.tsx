import { sleep } from "@src/lib/utils";
import { useEffect, useState } from "react";

import { useMajordomo } from "./provider";

export enum OverlayState {
  IDLE,
  CLARIFYING,
  RUNNING,
  EXITING,
  ERROR,
}

const shadowClassname = {
  [OverlayState.IDLE]: "pointer-events-none",
  [OverlayState.CLARIFYING]: "backdrop-blur-sm pointer-events-auto",
  [OverlayState.RUNNING]: "animate-pulse-shadow pointer-events-none",
  [OverlayState.EXITING]: "animate-static-shadow pointer-events-none",
  [OverlayState.ERROR]: "animate-static-shadow pointer-events-none",
};

const boxShadow = {
  [OverlayState.IDLE]: "",
  [OverlayState.CLARIFYING]: "inset 0 0 100px 20px rgba(0, 89, 255, 0.3)",
  [OverlayState.RUNNING]: "inset 0 0 100px 20px rgba(0, 89, 255, 0.3)",
  [OverlayState.EXITING]: "inset 0 0 100px 20px rgba(0, 128, 0, 0.3)",
  [OverlayState.ERROR]: "inset 0 0 100px 20px rgba(255, 0, 0, 0.3)",
};

export function Overlay({ children }: { children: React.ReactNode }) {
  const {
    currentTabIsWorking,
    loadState,
    stateTrigger,
    setOverlayBlur,
    setOverlayExit,
    setOverlayError,
  } = useMajordomo();

  const [overlayState, setOverlayState] = useState<OverlayState>(
    OverlayState.IDLE,
  );

  async function overlayBlur(blur: boolean) {
    if (blur) {
      setOverlayState(OverlayState.CLARIFYING);
    } else {
      setOverlayState(OverlayState.RUNNING);
    }
  }

  async function overlayExit(expl: string) {
    setOverlayState(OverlayState.EXITING);
    await new Promise((res) => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          document.removeEventListener("keydown", handleKeyDown);
          res(null);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
    });
  }

  async function overlayError() {
    setOverlayState(OverlayState.ERROR);
  }

  useEffect(() => {
    setOverlayBlur(overlayBlur);
    setOverlayExit(overlayExit);
    setOverlayError(overlayError);
  }, []);

  useEffect(() => {
    loadState().then(async (ext) => {
      if (!ext) {
        return;
      }
      if (!(await currentTabIsWorking())) {
        setOverlayState(OverlayState.IDLE);
        return;
      }

      if (ext.error) {
        setOverlayState(OverlayState.ERROR);
        return;
      }

      if (ext.userIntent) {
        setOverlayState(OverlayState.RUNNING);
      } else {
        setOverlayState(OverlayState.IDLE);
      }
    });
  }, [stateTrigger]);

  return (
    <div
      className={`fixed inset-0 z-[214748364] h-screen w-screen ${shadowClassname[overlayState]}`}
      style={{
        boxShadow: boxShadow[overlayState],
      }}
    >
      {children}
    </div>
  );
}
