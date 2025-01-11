import { Action, Action_v2 } from "@src/lib/interface/action";

/**
 * @TODO make AI do this?
 */
export async function summarizeAction({
  action,
  success,
}: {
  action: Action_v2;
  success?: boolean;
}) {
  const successStatus =
    success === undefined ? "Attempt" : success ? "Successfully" : "Failed to";

  switch (action.type) {
    case "navigate":
      return `${successStatus} navigate to ${action.url}`;
    case "click":
      return `${successStatus} click`;
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
