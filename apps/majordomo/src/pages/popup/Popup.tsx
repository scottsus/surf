import { ClerkProvider } from "@clerk/chrome-extension";

import { AuthPage } from "./auth";

// const { VITE_CLERK_PUBLISHABLE_KEY } = import.meta.env;
const VITE_CLERK_PUBLISHABLE_KEY = "pk_live_Y2xlcmsuc3VyZi5zY290dHN1cy5kZXYk";
const EXTENSION_URL = chrome.runtime.getURL(".");

export default function Popup(): JSX.Element {
  return (
    <ClerkProvider
      publishableKey={VITE_CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl={`${EXTENSION_URL}popup/index.html`}
      signInFallbackRedirectUrl={`${EXTENSION_URL}popup/index.html`}
      signUpFallbackRedirectUrl={`${EXTENSION_URL}popup/index.html`}
    >
      <AuthPage />
      <div className="flex" style={{ width: "900px", height: "1000px" }}>
        <h1>Surf 🏄‍♂️</h1>
        <p>hello</p>
      </div>
    </ClerkProvider>
  );
}
