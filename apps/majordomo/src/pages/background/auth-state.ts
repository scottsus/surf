let instance: AuthStateManager | null = null;

export class AuthStateManager {
  private isUserSignedIn: boolean = false;

  private constructor() {}

  public static getInstance(): AuthStateManager {
    if (!instance) {
      instance = new AuthStateManager();
    }

    return instance;
  }

  public getIsUserSignedIn(): boolean {
    return this.isUserSignedIn;
  }

  public updateUserSignedIn(isUserSignedIn: boolean) {
    this.isUserSignedIn = isUserSignedIn;
  }
}
