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
import { SignInButton, SignUpButton } from "./buttons";

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
      <PopupContent />
    </ClerkProvider>
  );
}

function PopupContent() {
  const { isSignedIn } = useAuth();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "2rem",
      }}
    >
      {isSignedIn ? <SignedInContent /> : <SignedOutContent />}
    </div>
  );
}

function SignedOutContent() {
  return (
    <div
      style={{
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h3 style={{ fontSize: "24px" }}>Welcome to 🏄‍♂️ Surf</h3>
      <p style={{ fontSize: "18px" }}>
        To get started, please sign in. Whitelist only. 🤫
      </p>
      <div
        style={{
          margin: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          columnGap: "1rem",
        }}
      >
        <SignInButton />
        <SignUpButton />
      </div>
    </div>
  );
}

function SignedInContent() {
  return (
    <>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: "32px" }}>🏄‍♂️ Surf</h1>
        <AuthPage />
      </div>
      <div
        style={{
          height: "20rem",
          display: "flex",
          flexDirection: "column",
          rowGap: "1.4rem",
          alignItems: "start",
          padding: "1rem",
        }}
      >
        <h3 style={{ margin: "0", fontSize: "18px" }}>
          Greetings traveller 👋
        </h3>
        <p style={{ margin: "0", fontSize: "16px", lineHeight: "1.4" }}>
          Surf is a fun PoC that demonstrates how multimodal language-vision
          models can be hooked up to your browser via a chrome extension and do
          some really cool stuff
        </p>
        <p style={{ margin: "0", fontSize: "16px", lineHeight: "1.4" }}>
          Surf is not meant to be a production grade workflow automator -
          although it can be if you want it to! Just contact @susantoscott or
          @chrispy on X and we can work something out 🤝
        </p>
        <p style={{ margin: "0", fontSize: "16px", lineHeight: "1.4" }}>
          To get started, hit{" "}
          <span style={{ color: "#88C0D0" }}>CMD + SHIFT + K</span> and watch
          the magic unfold
        </p>
      </div>
    </>
  );
}
