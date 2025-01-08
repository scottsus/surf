import { useMajordomo } from "./provider";

const USE_ANIMATE_PULSE_SHADOW = false;

export function Overlay({ children }: { children: React.ReactNode }) {
  const { extensionState } = useMajordomo();

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[2147483647] h-screen w-screen ${extensionState.userIntent !== "" ? (USE_ANIMATE_PULSE_SHADOW ? "animate-pulse-shadow" : "animate-static-shadow") : ""}`}
      style={{
        boxShadow:
          extensionState.userIntent !== ""
            ? "inset 0 0 100px 20px rgba(0, 89, 255, 0.3)"
            : "none",
      }}
    >
      {children}
    </div>
  );
}
