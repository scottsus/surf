export type Action =
  | { type: "navigate"; url: string }
  | { type: "click"; ariaLabel: string; targetDescription: string }
  | {
      type: "input";
      ariaLabel: string;
      targetDescription: string;
      content: string;
      withSubmit: boolean;
    }
  | { type: "refresh" }
  | { type: "back" }
  | { type: "done" };

export function stringify(action: Action) {
  switch (action.type) {
    case "navigate":
      return `navigating to ${action.url}...`;
    case "click":
      return `clicking "${action.targetDescription}"...`;
    case "input":
      return `typing into ${action.targetDescription}...`;
    case "refresh":
      return "refreshing page";
    case "back":
      return "going back";
    case "done":
      return "finished";
  }
}
