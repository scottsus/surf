import { completeSentence as completeSentenceWithAI } from "@src/lib/ai/api/complete-sentence";
import { useEffect } from "react";
import { toast } from "sonner";

// @TODO not working for google
export function Completer() {
  async function completeSentence() {
    const activeElement = findEditableElement(
      (window.getSelection()?.focusNode?.parentElement ||
        document.activeElement) as HTMLElement,
    );
    if (activeElement) {
      console.log(activeElement.tagName, activeElement.className);
    } else {
      console.log("none");
    }

    if (
      !activeElement ||
      (activeElement.tagName !== "INPUT" &&
        activeElement.tagName !== "TEXTAREA" &&
        !activeElement.contentEditable)
    ) {
      toast.info(
        "Please focus on an editable element like an input or textarea.",
      );
      return;
    }

    try {
      const currentSentence = getCurrentSentence({ element: activeElement });
      if (!currentSentence) {
        toast.error(
          "Please type something in the input - otherwise something may be wrong",
        );
        return;
      }

      const completionResponse = await completeSentenceWithAI({
        currentSentence,
      });
      if (!completionResponse) {
        toast.error("unable to generate completion");
        return;
      }
      if (!completionResponse.ok) {
        toast.error(`I don't know the answer to: ${currentSentence}`);
        return;
      }

      appendCurrentSentence({
        element: activeElement,
        completion: completionResponse.completion,
      });
    } catch (err) {
      toast.error(`error: ${err}`);
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.shiftKey && e.key === ";") {
        e.preventDefault();
        completeSentence();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return <></>;
}

function findEditableElement(element: HTMLElement | null): HTMLElement | null {
  if (!element) return null;

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element.isContentEditable
  ) {
    return element;
  }

  return findEditableElement(element.parentElement);
}

function getCurrentSentence({ element }: { element: HTMLElement }) {
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  ) {
    return element.value;
  }

  if (element.isContentEditable) {
    return element.textContent as string;
  }

  return "";
}

function appendCurrentSentence({
  element,
  completion,
}: {
  element: HTMLElement;
  completion: string;
}) {
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  ) {
    element.value += completion;
    element.selectionStart = element.selectionEnd = element.value.length;
  }

  if (element.isContentEditable) {
    element.textContent += completion;
  }
}
