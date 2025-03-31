import { ExtensionState } from "@src/lib/interface/state";

import { AuthStateManager } from "./auth-state";
import { ExtensionStateManager } from "./state";

console.log("background script loaded");

const authStateManager = AuthStateManager.getInstance();
const extensionStateManager = ExtensionStateManager.getInstance();

async function getCurrentTabId() {
  const currentTab = await new Promise<chrome.tabs.Tab | undefined>(
    (resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
          reject();
        }
        resolve(tabs[0]);
      });
    },
  );

  return currentTab?.id;
}

async function screenshot() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) {
      return;
    }

    await chrome.tabs.update(tab.id, { active: true });
    const screenshot = await chrome.tabs.captureVisibleTab();

    return { screenshot };
  } catch (error) {
    console.error("captureActiveTab:", error);
  }
}

async function getScreencastStreamId({
  targetTabId,
  consumerTabId,
}: {
  targetTabId: number;
  consumerTabId: number;
}) {
  const streamId = await new Promise<string>((resolve) => {
    chrome.tabCapture.getMediaStreamId(
      {
        targetTabId,
        consumerTabId,
      },
      resolve,
    );
  });

  return { streamId };
}

async function navigate({ url }: { url: string }) {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!tab?.id) {
    return;
  }

  await chrome.tabs.update(tab.id, { url });
}

async function refresh() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!tab?.id) return;

  await chrome.tabs.reload(tab.id);
}

async function back() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!tab?.id) return;

  await chrome.tabs.goBack(tab.id);
}

async function abort() {
  chrome.runtime.reload();
}

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "get_tab_id") {
    getCurrentTabId().then((id) => {
      sendResponse({ id });
    });

    return true;
  }
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "screenshot") {
    screenshot().then((res) => {
      sendResponse({ ok: res ? true : false, screenshot: res?.screenshot });
    });

    return true;
  }
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "navigate") {
    navigate({ url: message.url as string }).then(() => {
      sendResponse({ ok: true });
    });
  }

  return true;
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "refresh") {
    refresh().then(() => {
      sendResponse({ ok: true });
    });

    return true;
  }
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "back") {
    back().then(() => {
      sendResponse({ ok: true });
    });

    return true;
  }
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "load_state") {
    sendResponse(extensionStateManager.loadState());
  }

  return true;
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "save_state") {
    getCurrentTabId()
      .then((currentTabId) => {
        extensionStateManager.updateState({
          ...message.state,
          ...(currentTabId ? { workingTabId: currentTabId } : {}),
        } as Partial<ExtensionState>);
      })
      .then(() => sendResponse({ ok: true }));
  }

  return true;
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "clear_state") {
    extensionStateManager.clearState();
    sendResponse({ ok: true });
  }

  return true;
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "abort") {
    abort().then(() => {
      sendResponse({ ok: true });
    });
  }

  return true;
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "auth_state_changed") {
    authStateManager.updateUserSignedIn(message.isSignedIn);
    sendResponse({ ok: true });
  }

  return true;
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "get_auth_state") {
    sendResponse({ isSignedIn: authStateManager.getIsUserSignedIn() });
  }

  return true;
});

chrome.runtime.onMessage.addListener(async (message, _, sendResponse) => {
  if (message.action !== "screencast_in_background") return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    console.error("tabId undefined");
    return;
  }

  const streamId = await new Promise<string>((resolve) => {
    chrome.tabCapture.getMediaStreamId(
      {
        targetTabId: tab.id,
        consumerTabId: tab.id,
      },
      resolve,
    );
  });

  sendResponse({ streamId });
});

// on tab change
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const { tabId } = activeInfo;
    if (!tabId) {
      return;
    }

    const workingTabId = extensionStateManager.loadState().workingTabId;
    if (workingTabId === -1 || workingTabId === tabId) {
      return;
    }

    const screencast = await getScreencastStreamId({
      targetTabId: workingTabId,
      consumerTabId: tabId,
    });

    await chrome.tabs.sendMessage(tabId, {
      action: "tab_changed",
      streamId: screencast.streamId,
    });
  } catch (err) {
    // fails if workingTabId is invalid, no problem
  }
});

console.log("listeners initialized");
