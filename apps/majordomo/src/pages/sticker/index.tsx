import { createRoot } from "react-dom/client";

import "./index.css";

import { Toaster } from "sonner";

import { Sticker } from "./sticker";

const div = document.createElement("div");
div.id = "__root";
document.body.appendChild(div);

const rootContainer = document.querySelector("#__root");
if (!rootContainer) throw new Error("Can't find Content root element");
const root = createRoot(rootContainer);
root.render(
  <div>
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "white",
          padding: "16px",
        },
      }}
    />
    <Sticker />
  </div>,
);
