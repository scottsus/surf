import { ExtensionState } from "@src/lib/interface/state";

let instance: ExtensionStateManager | null = null;

export class ExtensionStateManager {
  private initialState: ExtensionState = {
    workingTabId: -1,
    step: 0,
    userIntent: "",
    history: [],
    cursorPosition: { x: 0, y: 0 },
  };
  private state = this.initialState;

  private constructor() {}

  public static getInstance(): ExtensionStateManager {
    if (!instance) {
      instance = new ExtensionStateManager();
    }
    return instance;
  }

  public loadState(): ExtensionState {
    return this.state;
  }

  public updateState(newState: Partial<ExtensionState>) {
    this.state = { ...this.state, ...newState };
  }

  public clearState() {
    this.state = this.initialState;
  }
}
