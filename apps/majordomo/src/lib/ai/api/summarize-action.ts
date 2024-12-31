import { Action } from "@src/lib/interface/action";

/**
 * @TODO make AI do this?
 */
export async function summarizeAction({
  action,
  success,
}: {
  action: Action;
  success: boolean;
}) {
  switch (action.type) {
    case "navigate":
      return `Attempt navigate to ${action.url}`;
    case "click":
      return `Attempt click on "${action.buttonDescription}"`;
    case "input":
      return `Attempt enter "${action.content}" into ${action.inputDescription}`;
    case "refresh":
      return `Attempt refresh the page`;
    case "back":
      return `Attempt go back to the previous page`;
    case "done":
      return `Task completed`;
  }
}
