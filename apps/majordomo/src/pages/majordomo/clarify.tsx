import { useEffect, useRef, useState } from "react";

import { useMajordomo } from "./provider";

const initialPrompt = import.meta.env.VITE_INITIAL_CLARIFY_PROMPT ?? "";

export function ClarifyInput() {
  const { setClarifyInput } = useMajordomo();

  const [isVisible, setIsVisible] = useState(false);
  const [inputValue, setInputValue] = useState(initialPrompt);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function clarifyInput() {
    setIsVisible(true);

    const inputPromise = await new Promise<string>((resolve) => {
      const onSubmit = (e: SubmitEvent) => {
        e.preventDefault();
        const userClarification = inputRef.current?.value ?? "<empty>";
        setInputValue("");
        resolve(userClarification);
      };

      const form = formRef.current;
      if (form) {
        form.addEventListener("submit", onSubmit, { once: true });
      }

      return () => {
        form && form.removeEventListener("submit", onSubmit);
      };
    });

    setIsVisible(false);

    return inputPromise;
  }

  useEffect(() => {
    if (isVisible) {
      inputRef.current?.focus();
    }
  }, [isVisible]);

  useEffect(() => {
    setClarifyInput(clarifyInput);
  }, [inputValue]);

  return (
    <form
      id="majordomo_clarify"
      className="rounded-full"
      ref={formRef}
      style={{
        width: "97%",
        padding: "0 1rem",
        backgroundColor: "white",
        border: "1px solid #D6DFFF",
        display: isVisible ? "block" : "none",
        boxShadow: "0 0 5px 0px rgb(91, 126, 255)",
        overflow: "hidden",
        pointerEvents: "auto",
      }}
    >
      <input
        ref={inputRef}
        placeholder="Reply to Surf"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full rounded-xl bg-transparent text-xl [&::selection]:bg-blue-200 [&::selection]:text-blue-800"
        style={{
          fontSize: "1em",
          color: "#777980",
          border: "none",
          outline: "none",
          caretColor: "#5B7EFF",
          padding: "0.5em",
        }}
      />
    </form>
  );
}
