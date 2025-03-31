import {
  clearAuthData,
  ClerkAuthData,
  retrieveAuthData,
  storeAuthData,
} from "./storage";

export async function storeClerkSession(
  token: string,
  expiresInSeconds?: number,
  userId?: string,
): Promise<boolean> {
  try {
    const expiresAt = expiresInSeconds
      ? Date.now() + expiresInSeconds * 1000
      : undefined;

    const authData: ClerkAuthData = {
      token,
      expiresAt,
      userId,
      lastUpdated: Date.now(),
    };

    const success = await storeAuthData(authData);
    if (success) {
      await chrome.runtime.sendMessage({
        action: "auth_state_changed",
        isSignedIn: true,
      });
    }

    return success;
  } catch (error) {
    console.error("storeClerkSession failed:", error);
    return false;
  }
}

export async function clearClerkSession(): Promise<boolean> {
  const success = await clearAuthData();
  if (success) {
    await chrome.runtime.sendMessage({
      action: "auth_state_changed",
      isSignedIn: false,
    });
  }

  return success;
}

export async function getClerkSessionToken(): Promise<string | null> {
  const authData = await retrieveAuthData();
  return authData?.token || null;
}

export async function isUserSignedIn(): Promise<boolean> {
  try {
    const authData = await retrieveAuthData();
    if (!authData || !authData.token) {
      return false;
    }
    if (authData.expiresAt && authData.expiresAt < Date.now()) {
      await clearAuthData();
      return false;
    }

    return true;
  } catch (error) {
    console.error("failed to check if user is signed in:", error);
    return false;
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  const authData = await retrieveAuthData();
  return authData?.userId || null;
}
