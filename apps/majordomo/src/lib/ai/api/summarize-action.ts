import { Action, Action_v2 } from "@src/lib/interface/action";

export async function summarizeAction({
  action,
  userInput,
  success = true, // @TODO: evaluate this
}: {
  action: Action_v2;
  userInput?: string;
  success?: boolean;
}) {
  const successStatus =
    success === undefined ? "Attempt" : success ? "Successfully" : "Failed to";

  switch (action.type) {
    case "navigate":
      return `${successStatus} navigate to ${action.url}`;
    case "clarify":
      return `clarified ${action.question}; user said ${userInput}`;
    case "click":
      return `${successStatus} click ${action.description}`;
    case "input":
      return `${successStatus} input "${action.content}"`;
    case "refresh":
      return `${successStatus} refresh the page`;
    case "back":
      return `${successStatus} go back to the previous page`;
    case "done":
      return `Task completed`;
  }
}
