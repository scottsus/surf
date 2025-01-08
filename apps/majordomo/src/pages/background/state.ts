import { ExtensionState } from "@src/lib/interface/state";

const extensionStateKey = "extension_state";

export async function loadState(): Promise<ExtensionState | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get([extensionStateKey], (result) => {
      resolve(result[extensionStateKey] as ExtensionState | null);
    });
  });
}

export async function saveState(extensionState: ExtensionState) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [extensionStateKey]: extensionState }, () =>
      resolve(undefined),
    );
  });
}

export async function clearState() {
  return new Promise((resolve) => {
    chrome.storage.local.clear(() => resolve(undefined));
  });
}
