import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useMajordomo } from "./provider";

const USE_ANIMATE_PULSE_SHADOW = false;

export enum OverlayState {
  IDLE,
  RUNNING,
  EXITING,
}

export function Overlay({ children }: { children: React.ReactNode }) {
  const {
    currentTabIsWorking,
    loadState,
    stateTrigger,
    overlayState,
    setOverlayState,
  } = useMajordomo();

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
      className={`pointer-events-none fixed inset-0 z-[2147483647] h-screen w-screen ${
        overlayState !== OverlayState.IDLE
          ? USE_ANIMATE_PULSE_SHADOW
            ? "animate-pulse-shadow"
            : "animate-static-shadow"
          : ""
      }`}
      style={{
        boxShadow:
          overlayState !== OverlayState.IDLE
            ? overlayState === OverlayState.RUNNING
              ? "inset 0 0 100px 20px rgba(0, 89, 255, 0.3)"
              : "inset 0 0 100px 20px rgba(0, 128, 0, 0.3)"
            : "none",
      }}
    >
      {children}
    </div>
  );
}
