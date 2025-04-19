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
        Surf is whitelist only 🤫
      </h2>
      <p
        style={{
          marginBottom: "3rem",
          lineHeight: "1.5",
          fontSize: "18px",
          textAlign: "center",
        }}
      >
        Please login by pressing the 🏄‍♂️ icon on your extensions bar
      </p>
      <button
        onClick={onClick}
        style={{
          display: "block",
          margin: "0 auto",
          padding: "0.5rem 2rem",
          backgroundColor: "#1e293b",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          fontSize: "18px",
          fontWeight: "600",
          cursor: "pointer",
          transition: "background-color 0.2s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = "#334155";
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "#1e293b";
          e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
        }}
      >
        Ok 👌
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
