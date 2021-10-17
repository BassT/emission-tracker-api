export interface Authenticator {
  authenticateRequest(req: {
    headers: { [prop: string]: string | string[] | undefined };
  }): Promise<{ userId?: string; error?: ErrorCode }>;
}

export class NaiveAuthenticator implements Authenticator {
  async authenticateRequest(req: {
    headers: { [prop: string]: string | string[] | undefined };
  }): Promise<{ userId?: string; error?: ErrorCode }> {
    if (req.headers["x-naive-auth"]) {
      if (typeof req.headers["x-naive-auth"] === "string") {
        return { userId: req.headers["x-naive-auth"] };
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
