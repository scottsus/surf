import { SignedIn, UserButton } from "@clerk/chrome-extension";

export function AuthPage() {
  return (
    <SignedIn>
      <UserButton />
    </SignedIn>
  );
}
