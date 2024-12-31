import { CursorCoordinate } from "@src/pages/majordomo/provider";

import { ActionMetadata } from "./action-metadata";

export type ExtensionState = {
  userIntent: string;
  history: ActionMetadata[];
  cursorPosition: CursorCoordinate;
  abort: boolean;
};
