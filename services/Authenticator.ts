export interface Authenticator {
  authenticateRequest(req: {
    headers: { [prop: string]: string | string[] | undefined };
  }): Promise<{ userId?: string; error?: ErrorCode }>;
}

export class MockAuthenticatorBuilder {
  userId?: string;
  error?: ErrorCode;

  constructor() {}

  withUserId(userId: string) {
    this.userId = userId;
    return this;
  }

  withErrorCode(error?: ErrorCode) {
    this.error = error;
    return this;
  }

  build(): Authenticator {
    return {
      authenticateRequest: async () => ({
        userId: this.userId,
        error: this.error,
      }),
    };
  }
}

export class NaiveAuthenticator implements Authenticator {
  async authenticateRequest(req: {
    headers: { [prop: string]: string | string[] | undefined };
  }): Promise<{ userId?: string; error?: ErrorCode }> {
    const xNaiveAuth = req.headers["x-naive-auth"] || req.headers["xNaiveAuth"];
    if (xNaiveAuth) {
      if (typeof xNaiveAuth === "string") {
        return { userId: xNaiveAuth };
      }
      return { error: ErrorCode.AUTH_HEADER_INVALID_FORMAT };
    }
    return { error: ErrorCode.AUTH_HEADER_MISSING_OR_EMPTY };
  }
}

export enum ErrorCode {
  AUTH_HEADER_MISSING_OR_EMPTY = "AUTH_HEADER_MISSING_OR_EMPTY",
  AUTH_HEADER_INVALID_FORMAT = "AUTH_HEADER_INVALID_FORMAT",
}
