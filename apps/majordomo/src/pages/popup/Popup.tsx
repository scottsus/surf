import {
  ClerkProvider,
  useAuth,
  useSession,
  useUser,
} from "@clerk/chrome-extension";
import {
  clearClerkSession,
  storeClerkSession,
} from "@src/lib/auth/clerk-helper";
import { VITE_CLERK_PUBLISHABLE_KEY } from "@src/lib/env";
import { useEffect } from "react";

import { AuthPage } from "./auth";

function AuthStateManager() {
  const { isSignedIn } = useAuth();
  const { session } = useSession();
  const { user } = useUser();

  useEffect(() => {
    const handleAuthChange = async () => {
      if (isSignedIn && session) {
        const token = await session.getToken();
        if (token) {
          const expiresIn = session.expireAt
            ? Math.floor(
                (new Date(session.expireAt).getTime() - Date.now()) / 1000,
              )
            : undefined;

          await storeClerkSession(token, expiresIn, user?.id);
        }
      } else {
        await clearClerkSession();
      }
    };

    handleAuthChange();
  }, [isSignedIn, session, user]);

  return <></>;
}

export default function Popup(): JSX.Element {
  return (
    <ClerkProvider publishableKey={VITE_CLERK_PUBLISHABLE_KEY}>
      <AuthStateManager />
      <AuthPage />
      <div className="flex" style={{ width: "900px", height: "1000px" }}>
        <h1>Surf 🏄‍♂️</h1>
        <p>hello</p>
      </div>
    </ClerkProvider>
  );
}
