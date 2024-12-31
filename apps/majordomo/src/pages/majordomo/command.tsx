import { MicIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useMajordomo } from "./provider";

const USE_VOICE_MODE = false;

export function CommandBar() {
  const { setUserIntent } = useMajordomo();
  const [isVisible, setIsVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();

    await setUserIntent(inputValue);
    setIsVisible(false);
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.shiftKey && e.key === "k") {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isVisible) {
      inputRef.current?.focus();
    }
  }, [isVisible]);

  if (!isVisible) {
    return <></>;
  }
  return (
    <form
      id="majordomo"
      className="pointer-events-auto fixed z-[2147483648] rounded-2xl bg-white p-4"
      style={{
        left: "calc(50vw - 32.5vh)",
        top: "calc(30vh - 5vh)",
        width: "65vh",
        border: "4px solid #D6DFFF",
        display: isVisible ? "block" : "hidden",
        boxShadow: "0 0 20px 0px rgb(91, 126, 255)",
      }}
    >
      <div className="flex w-full items-center">
        <div
          className="relative flex w-full items-center rounded-xl p-1"
          style={{
            backgroundColor: "#EEF2FF",
          }}
        >
          <input
            ref={inputRef}
            placeholder="Talk to surf..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full rounded-xl bg-transparent p-2 text-xl [&::selection]:bg-blue-200 [&::selection]:text-blue-800"
            style={{
              color: "#777980",
              border: "none",
              outline: "none",
              caretColor: "#5B7EFF",
            }}
          />
          {USE_VOICE_MODE && (
            <div
              className="absolute right-0 flex cursor-pointer rounded-full bg-white p-1"
              style={{ marginRight: "10px" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#ebedf0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "white")
              }
            >
              <MicIcon color="black" />
            </div>
          )}
        </div>
        <button onClick={onClick} className="hidden" />
      </div>

      <h3
        className="text-sm font-light"
        style={{
          color: "#808080",
          paddingLeft: "0.5em",
        }}
      >
        SUGGESTIONS
      </h3>
      <div className="flex flex-col" style={{ color: "#404040" }}>
        <p
          className="rounded-md p-2"
          style={{ paddingLeft: "1em", margin: 0, cursor: "pointer" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#ebedf0")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
          onClick={(e) => {
            const input = e.currentTarget.textContent?.trim() ?? "";
            setInputValue(input);
            setUserIntent(input);
            setIsVisible(false);
          }}
        >
          🎧 Play "never gonna give you up on Youtube"
        </p>
        <p
          className="rounded-md p-2"
          style={{ paddingLeft: "1em", margin: 0, cursor: "pointer" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#ebedf0")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
          onClick={(e) => {
            const input = e.currentTarget.textContent?.trim() ?? "";
            setInputValue(input);
            setUserIntent(input);
            setIsVisible(false);
          }}
        >
          📅 When&apos;s my next meeting?
        </p>
        <p
          className="rounded-md p-2"
          style={{ paddingLeft: "1em", margin: 0, cursor: "pointer" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#ebedf0")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
          onClick={(e) => {
            const input = e.currentTarget.textContent?.trim() ?? "";
            setInputValue(input);
            setUserIntent(input);
            setIsVisible(false);
          }}
        >
          🏃‍♀️ On running Cloudmonster
        </p>
      </div>
    </form>
  );
}
