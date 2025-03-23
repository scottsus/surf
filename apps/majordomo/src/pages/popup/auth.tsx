import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/chrome-extension";

export function AuthPage() {
  return (
    <div>
      <SignedOut>
        <SignInButton mode="modal" />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}
