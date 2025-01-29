import { Action } from "./action";

export type ThinkingState =
  | { type: "idle" }
  | { type: "awaiting_ui_changes" }
  | { type: "deciding_action" }
  | { type: "action"; action: Action }
  | { type: "clicking_button" }
  | { type: "require_assistance" }
  | { type: "aborted" }
  | { type: "done" };
