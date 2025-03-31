import { useMajordomo } from "./provider";

export function AuthGate({
  isVisible,
  setIsVisible,
}: {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const width = "30vw";
  const left = "15vw";
  const onClick = () => setIsVisible(false);

  return (
    <div
      className="pointer-events-auto fixed z-[2147483648] rounded-2xl bg-white text-black"
      style={{
        left: `calc(50vw - ${left})`,
        top: "calc(30vh - 5vh)",
        width: width,
        border: "1px solid #D6DFFF",
        display: isVisible ? "block" : "hidden",
        boxShadow: "0 0 10px 0px rgb(91, 126, 255)",
        overflow: "hidden",
        padding: "2rem",
      }}
    >
      <h2 style={{ width: "100%", textAlign: "center", marginBottom: "3rem" }}>
        Please login to continue using Surf by clicking on the 🏄‍♂️ popup
      </h2>
      <p style={{ marginBottom: "2rem", lineHeight: "1.5", fontSize: "1rem" }}>
        Once you&apos;re done, hit CMD+SHIFT+K again and we&apos;ll see you here
        👋
      </p>
      <button
        onClick={onClick}
        style={{
          display: "block",
          margin: "0 auto",
          padding: "0.5rem 1rem",
          backgroundColor: "#5B7EFF",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          fontSize: "1rem",
          fontWeight: "500",
          cursor: "pointer",
          transition: "background-color 0.2s ease",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#4A6AE5")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#5B7EFF")}
      >
        OK
      </button>
    </div>
  );
}

export function AuthStatus() {
  const { authState } = useMajordomo();
  const { isSignedIn, userId, isLoading } = authState;

  if (isLoading) {
    return (
      <div className="auth-status">
        <p>Loading auth state...</p>
      </div>
    );
  }

  return (
    <div className="auth-status">
      {isSignedIn ? (
        <div>
          <p>✅ Signed in</p>
          {userId && <p>User ID: {userId}</p>}
        </div>
      ) : (
        <p>❌ Not signed in</p>
      )}
    </div>
  );
}

export function AuthProtectedComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authState } = useMajordomo();
  const { isSignedIn, isLoading } = authState;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div>
        <p>Please sign in to access this feature</p>
      </div>
    );
  }

  return <>{children}</>;
}
