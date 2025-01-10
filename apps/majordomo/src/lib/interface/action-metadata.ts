import { Action } from "./action";

export enum ActionState {
  IN_PROGRESS,
  SUCCESS,
  FAILED,
}

export type ActionMetadata = {
  action: Action;
  querySelector: string;
  summary: string;
  state: ActionState;
};
