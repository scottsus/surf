import { useEffect, useState } from "react";

import { useMajordomo } from "./provider";

const USE_ANIMATE_PULSE_SHADOW = false;

export function Overlay({ children }: { children: React.ReactNode }) {
  const { stateTrigger, loadState } = useMajordomo();
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    loadState().then((ext) => {
      if (ext?.userIntent) {
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    });
  }, [stateTrigger]);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[2147483647] h-screen w-screen ${isRunning ? (USE_ANIMATE_PULSE_SHADOW ? "animate-pulse-shadow" : "animate-static-shadow") : ""}`}
      style={{
        boxShadow: isRunning
          ? "inset 0 0 100px 20px rgba(0, 89, 255, 0.3)"
          : "none",
      }}
    >
      {children}
    </div>
  );
}
