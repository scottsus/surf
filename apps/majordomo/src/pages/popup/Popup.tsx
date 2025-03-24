import { ClerkProvider } from "@clerk/chrome-extension";
import { useEffect } from "react";

import { AuthPage } from "./auth";

// const { VITE_CLERK_PUBLISHABLE_KEY } = import.meta.env;
const VITE_CLERK_PUBLISHABLE_KEY = "pk_live_Y2xlcmsuc3VyZi5zY290dHN1cy5kZXYk";
const EXTENSION_URL = chrome.runtime.getURL(".");

export default function Popup(): JSX.Element {
  // This effect runs once when the component mounts
  useEffect(() => {
    // Add a request interceptor to modify fetch requests
    const originalFetch = window.fetch;
    window.fetch = function (input, init) {
      // Only modify requests to Clerk domains
      if (
        typeof input === "string" &&
        input.includes("clerk.surf.scottsus.dev")
      ) {
        // Create a new init object to avoid modifying the original
        const newInit = init ? { ...init } : {};

        // Ensure headers object exists
        newInit.headers = newInit.headers || {};

        // Remove Authorization header if Origin is present
        // The browser will automatically add Origin, so we just need to ensure
        // Authorization is not present to avoid the conflict
        if (newInit.headers instanceof Headers) {
          if (newInit.headers.has("Authorization")) {
            const headers = new Headers(newInit.headers);
            headers.delete("Authorization");
            newInit.headers = headers;
          }
        } else if (
          typeof newInit.headers === "object" &&
          newInit.headers !== null
        ) {
          // For plain objects, use type assertion to handle TypeScript errors
          const headers = newInit.headers as Record<string, string>;
          if ("Authorization" in headers) delete headers["Authorization"];
          if ("authorization" in headers) delete headers["authorization"];
        }

        return originalFetch(input, newInit);
      }

      // Pass through unmodified for non-Clerk requests
      return originalFetch(input, init);
    };

    // Cleanup function to restore original fetch when component unmounts
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

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
