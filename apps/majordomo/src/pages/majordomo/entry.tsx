import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";

import { ClarifyInput } from "./clarify";
import { CommandBar } from "./command";
import { Completer } from "./completer";
import { Cursor } from "./cursor";
import styles from "./index.css?inline";
import { Overlay } from "./overlay";
import { Pip } from "./pip";
import { MajordomoProvider } from "./provider";

const rootElement = document.createElement("div");
document.body.appendChild(rootElement);

const shadowRoot = rootElement.attachShadow({ mode: "open" });

const appElement = document.createElement("div");
appElement.style.zIndex = "2147483647";
shadowRoot.appendChild(appElement);

// adapted from https://github.com/crxjs/chrome-extension-tools/discussions/727

const contentAppReset = document.createElement("style");
shadowRoot.append(contentAppReset);
contentAppReset.textContent = `:host {all: initial;}`;

const contentScriptStyles = document.createElement("style");
shadowRoot.append(contentScriptStyles);
contentScriptStyles.textContent = styles;

const toastElement = document.createElement("div");
document.body.appendChild(toastElement);
const toastRoot = createRoot(toastElement);

toastRoot.render(
  <Toaster
    position="top-center"
    toastOptions={{
      style: {
        background: "white",
        padding: "16px",
      },
    }}
  />,
);

const root = createRoot(appElement);
root.render(
  <div
    style={{
      fontFamily: "sans-serif",
    }}
  >
    <style type="text/css">{styles.toString()}</style>
    <MajordomoProvider>
      <Overlay>
        <CommandBar />
        <Pip />
        <Cursor />
        <Completer />
      </Overlay>
    </MajordomoProvider>
  </div>,
);
