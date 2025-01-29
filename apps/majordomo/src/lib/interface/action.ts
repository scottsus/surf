export type Action_v2 =
  | { type: "navigate"; url: string }
  | { type: "clarify"; question: string }
  | { type: "click"; idx: number; description: string }
  | {
      type: "input";
      idx: number;
      content: string;
      withSubmit: boolean;
    }
  | { type: "refresh" }
  | { type: "back" }
  | { type: "done"; explanation: string };

export function stringify(action: Action_v2) {
  switch (action.type) {
    case "navigate":
      return `navigating to ${action.url}...`;
    case "clarify":
      return `${action.question}`;
    case "click":
      return `clicking "${action.description}"...`;
    case "input":
      return `typing ${action.content}...`;
    case "refresh":
      return "refreshing page";
    case "back":
      return "going back";
    case "done":
      return action.explanation;
  }
}
