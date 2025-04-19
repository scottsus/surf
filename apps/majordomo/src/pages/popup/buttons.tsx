import {
  SignInButton as ClerkSignInButton,
  SignUpButton as ClerkSignUpButton,
} from "@clerk/chrome-extension";

export function SignInButton() {
  return (
    <ClerkSignInButton mode="modal">
      <button
        style={{
          color: "white",
          backgroundColor: "#1e293b",
          border: "none",
          padding: "8px 16px",
          borderRadius: "4px",
          fontSize: "18px",
          fontWeight: "600",
          transition: "all 0.2s ease",
          cursor: "pointer",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
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
        Sign In
      </button>
    </ClerkSignInButton>
  );
}

export function SignUpButton() {
  return (
    <ClerkSignUpButton mode="modal">
      <button
        style={{
          color: "#1e293b",
          backgroundColor: "white",
          border: "1px solid #1e293b",
          padding: "8px 16px",
          borderRadius: "4px",
          fontSize: "18px",
          fontWeight: "600",
          transition: "all 0.2s ease",
          cursor: "pointer",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = "#f8fafc";
          e.currentTarget.style.borderColor = "#334155";
          e.currentTarget.style.color = "#334155";
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "white";
          e.currentTarget.style.borderColor = "#1e293b";
          e.currentTarget.style.color = "#1e293b";
          e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
        }}
      >
        Sign Up
      </button>
    </ClerkSignUpButton>
  );
}
