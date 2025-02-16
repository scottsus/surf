import { Action, stringify } from "./action";

export type ThinkingState =
  | { type: "idle" }
  | { type: "awaiting_ui_changes" }
  | { type: "deciding_action" }
  | { type: "action"; action: Action }
  | { type: "clicking_button" }
  | { type: "require_assistance" }
  | { type: "aborted" }
  | { type: "error"; errorMessage: string }
  | { type: "done" };

export function stringifyThinkingState(state: ThinkingState) {
  switch (state.type) {
    case "idle":
      return "ready";
    case "awaiting_ui_changes":
      return "awaiting UI changes...";
    case "deciding_action":
      return "deciding on next action...";
    case "action":
      return stringify(state.action);
    case "clicking_button":
      return "choosing the right button...";
    case "require_assistance":
      return "unable to complete task - require assistance";
    case "aborted":
      return "aborted!";
    case "error":
      return `error: ${state.errorMessage}. ctrl+c to reset.`;
    case "done":
      return "done!";
  }
}
