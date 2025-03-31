import {
  getClerkSessionToken,
  getCurrentUserId,
  isUserSignedIn,
} from "@src/lib/auth/clerk-helper";
import { AuthState } from "@src/lib/interface/auth-state";
import { useEffect, useState } from "react";

/**
 * Hook to access auth state in any component
 * can be used in content script without requiring ClerkProvider
 */
export function useAuthState(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    isSignedIn: false,
    userId: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    const loadAuthState = async () => {
      const signedIn = await isUserSignedIn();
      if (signedIn) {
        const [userId, token] = await Promise.all([
          getCurrentUserId(),
          getClerkSessionToken(),
        ]);

        setAuthState({
          isSignedIn: true,
          userId,
          token,
          isLoading: false,
        });
      } else {
        setAuthState({
          isSignedIn: false,
          userId: null,
          token: null,
          isLoading: false,
        });
      }
    };

    loadAuthState();

    const handleStorageChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => {
      if (areaName === "local" && changes["clerk_auth_data"]) {
        loadAuthState();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  return authState;
}

export async function checkAuthState(): Promise<AuthState> {
  try {
    const signedIn = await isUserSignedIn();
    if (signedIn) {
      const [userId, token] = await Promise.all([
        getCurrentUserId(),
        getClerkSessionToken(),
      ]);

      return {
        isSignedIn: true,
        userId,
        token,
        isLoading: false,
      };
    } else {
      return {
        isSignedIn: false,
        userId: null,
        token: null,
        isLoading: false,
      };
    }
  } catch (error) {
    console.error("failed to check auth state:", error);
    return {
      isSignedIn: false,
      userId: null,
      token: null,
      isLoading: false,
    };
  }
}
