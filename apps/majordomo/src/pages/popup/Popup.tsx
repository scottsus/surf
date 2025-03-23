import { ClerkProvider } from "@clerk/chrome-extension";

import { AuthPage } from "./auth";

const { VITE_CLERK_PUBLISHABLE_KEY } = import.meta.env;

export default function Popup(): JSX.Element {
  return (
    <ClerkProvider publishableKey={VITE_CLERK_PUBLISHABLE_KEY}>
      <AuthPage />
      <div className="flex" style={{ width: "900px", height: "1000px" }}>
        <h1>Surf 🏄‍♂️</h1>
        <p>hello</p>
      </div>
    </ClerkProvider>
  );
}
