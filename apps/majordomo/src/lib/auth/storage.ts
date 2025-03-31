const AUTH_STORAGE_KEY = "clerk_auth_data";

const ENCRYPTION_KEY = "surf_auth_encryption_key";

export interface ClerkAuthData {
  token: string;
  expiresAt?: number;
  userId?: string;
  lastUpdated: number;
}

/**
 * @TODO use a more secure library
 */
export function encryptData(data: string): string {
  let encrypted = "";
  for (let i = 0; i < data.length; i++) {
    const charCode =
      data.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
    encrypted += String.fromCharCode(charCode);
  }
  return btoa(encrypted);
}

export function decryptData(encryptedData: string): string {
  try {
    const data = atob(encryptedData); // Base64 decode
    let decrypted = "";
    for (let i = 0; i < data.length; i++) {
      const charCode =
        data.charCodeAt(i) ^
        ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      decrypted += String.fromCharCode(charCode);
    }
    return decrypted;
  } catch (error) {
    console.error("Failed to decrypt data:", error);
    return "";
  }
}

export async function storeAuthData(authData: ClerkAuthData): Promise<boolean> {
  try {
    const dataToStore = {
      ...authData,
      lastUpdated: Date.now(),
    };

    const encryptedData = encryptData(JSON.stringify(dataToStore));

    await chrome.storage.local.set({ [AUTH_STORAGE_KEY]: encryptedData });

    return true;
  } catch (error) {
    console.error("storeAuthData failed:", error);
    return false;
  }
}

export async function retrieveAuthData(): Promise<ClerkAuthData | null> {
  try {
    const result = await chrome.storage.local.get([AUTH_STORAGE_KEY]);
    const encryptedData = result[AUTH_STORAGE_KEY];

    if (!encryptedData) {
      console.log("no auth data found in storage");
      return null;
    }

    const decryptedData = decryptData(encryptedData);
    if (!decryptedData) {
      console.error("failed to decrypt auth data");
      return null;
    }

    const authData = JSON.parse(decryptedData) as ClerkAuthData;

    if (!authData.token || !authData.lastUpdated) {
      console.error("retrieved auth data invalid");
      return null;
    }

    if (authData.expiresAt && authData.expiresAt < Date.now()) {
      console.log("auth token expired");
      await clearAuthData();
      return null;
    }

    return authData;
  } catch (error) {
    console.error("retrieveAuthData failed:", error);
    return null;
  }
}

export async function clearAuthData(): Promise<boolean> {
  try {
    await chrome.storage.local.remove([AUTH_STORAGE_KEY]);
    console.log("auth data cleared");
    return true;
  } catch (error) {
    console.error("clearAuthData failed:", error);
    return false;
  }
}

export async function hasValidAuthData(): Promise<boolean> {
  const authData = await retrieveAuthData();
  if (!authData) {
    return false;
  }

  if (authData.expiresAt && authData.expiresAt < Date.now()) {
    await clearAuthData();
    return false;
  }

  return true;
}
