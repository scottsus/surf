import { Action } from "./action";

export type ActionMetadata = {
  action: Action;
  querySelector: string;
  summary: string;
};
