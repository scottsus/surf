import { ExtensionState } from "@src/lib/interface/state";

const extensionStateKey = "extension_state";

export function loadState(): Promise<ExtensionState | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get([extensionStateKey], (result) => {
      resolve(result[extensionStateKey] as ExtensionState | null);
    });
  });
}

export function saveState(extensionState: ExtensionState) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [extensionStateKey]: extensionState }, () =>
      resolve(undefined),
    );
  });
}

export function clearState() {
  return new Promise((resolve) => {
    chrome.storage.local.clear(() => resolve(undefined));
  });
}
