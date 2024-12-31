/**
 * Goal: evaluate previous command - change it from "attempted" to "success" or "fail"
 * also, all history changes are updated here
 */

import { ActionMetadata } from "../interface/action-metadata";

export class HistoryManager {
  private static instance: HistoryManager;
  private history: ActionMetadata[] = [];

  private appendHistory: (actionMetadata: ActionMetadata) => Promise<void>;

  private constructor({
    appendHistory,
  }: {
    appendHistory: (actionMetadata: ActionMetadata) => Promise<void>;
  }) {
    this.appendHistory = appendHistory;
  }

  public static getInstance({
    appendHistory,
  }: {
    appendHistory: (actionMetadata: ActionMetadata) => Promise<void>;
  }): HistoryManager {
    if (!HistoryManager.instance) {
      HistoryManager.instance = new HistoryManager({ appendHistory });
    }
    return HistoryManager.instance;
  }

  public loadHistory(history: ActionMetadata[]) {
    this.history = history;
  }

  public getLocalHistory() {
    return this.history;
  }

  public async updateHistory(actionMetadata: ActionMetadata) {
    this.updateLocalHistory(actionMetadata);
    await this.updateBrowserHistory(actionMetadata);
  }

  private updateLocalHistory(actionMetadata: ActionMetadata) {
    this.history.push(actionMetadata);
  }

  private async updateBrowserHistory(actionMetadata: ActionMetadata) {
    await this.appendHistory(actionMetadata);
  }

  public evaluatePreviousAction({ screenshot }: { screenshot: string }) {
    // @TODO
  }
}
