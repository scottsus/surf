export interface AuthState {
  isSignedIn: boolean;
  userId: string | null;
  token: string | null;
  isLoading: boolean;
}
