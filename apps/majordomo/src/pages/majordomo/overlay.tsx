import { sleep } from "@src/lib/utils";
import { useEffect, useState } from "react";

import { useMajordomo } from "./provider";

export enum OverlayState {
  IDLE,
  CLARIFYING,
  RUNNING,
  EXITING,
}

const shadowClassname = {
  [OverlayState.IDLE]: "pointer-events-none",
  [OverlayState.CLARIFYING]: "backdrop-blur-sm pointer-events-auto",
  [OverlayState.RUNNING]: "animate-pulse-shadow pointer-events-none",
  [OverlayState.EXITING]: "animate-static-shadow pointer-events-none",
};

const boxShadow = {
  [OverlayState.IDLE]: "",
  [OverlayState.CLARIFYING]: "inset 0 0 100px 20px rgba(0, 89, 255, 0.3)",
  [OverlayState.RUNNING]: "inset 0 0 100px 20px rgba(0, 89, 255, 0.3)",
  [OverlayState.EXITING]: "inset 0 0 100px 20px rgba(0, 128, 0, 0.3)",
};

export function Overlay({ children }: { children: React.ReactNode }) {
  const {
    currentTabIsWorking,
    loadState,
    stateTrigger,
    setOverlayBlur,
    setOverlayExit,
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

  async function overlayExit() {
    setOverlayState(OverlayState.EXITING);
    await sleep(1500);
  }

  useEffect(() => {
    setOverlayBlur(overlayBlur);
    setOverlayExit(overlayExit);
  });

  useEffect(() => {
    loadState().then(async (ext) => {
      if (!(await currentTabIsWorking())) {
        setOverlayState(OverlayState.IDLE);
        return;
      }

      if (ext?.userIntent) {
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
