import { CursorCoordinate } from "@src/pages/majordomo/provider";

import { ActionMetadata } from "./action-metadata";

export type ExtensionState = {
  workingTabId: number;
  step: number;
  userIntent: string;
  history: ActionMetadata[][];
  cursorPosition: CursorCoordinate;
};
