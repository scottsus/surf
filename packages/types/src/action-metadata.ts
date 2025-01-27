import { Action_v2 } from "./action";

export enum ActionState {
  IN_PROGRESS,
  SUCCESS,
  FAILED,
}

export type ActionMetadata = {
  action: Action_v2;
  querySelector: string;
  summary: string;
  state: ActionState;
};
