import { Action } from "@src/lib/interface/action";

/**
 * @TODO make AI do this?
 */
export async function summarizeAction({
  action,
  success,
}: {
  action: Action;
  success?: boolean;
}) {
  const successStatus =
    success === undefined ? "Attempt" : success ? "Successfully" : "Failed to";

  switch (action.type) {
    case "navigate":
      return `${successStatus} navigate to ${action.url}`;
    case "click":
      return `${successStatus} click on "${action.ariaLabel}"`;
    case "input":
      return `${successStatus} enter "${action.content}" into ${action.ariaLabel}`;
    case "refresh":
      return `${successStatus} refresh the page`;
    case "back":
      return `${successStatus} go back to the previous page`;
    case "done":
      return `Task completed`;
  }
}
