export type Action =
  | { type: "navigate"; url: string }
  | { type: "click"; buttonDescription: string }
  | { type: "input"; inputDescription: string; content: string }
  | { type: "refresh" }
  | { type: "back" }
  | { type: "done" };

export function stringify(action: Action) {
  switch (action.type) {
    case "navigate":
      return `navigating to ${action.url}...`;
    case "click":
      return `clicking "${action.buttonDescription}"...`;
    case "input":
      return `typing into ${action.inputDescription}...`;
    case "refresh":
      return "refreshing page";
    case "back":
      return "going back";
    case "done":
      return "finished";
  }
}
