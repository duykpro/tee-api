import { ErrorResponse } from "./responses";

export interface ErrorObject {
  domain: string;
  code: string;
  reason: string;
  message: string;
  sourceType: string;
  source: string;
}

export class APIError extends Error {
  private errors: ErrorObject[];

  constructor(...errors: ErrorObject[]) {
    super(errors[0].message);

    this.errors = errors;
  }

  public getHTTPStatus(): number {
    return +this.errors[0].code;
  }

  public getResponse(): ErrorResponse {
    return {
      error: {
        errors: this.errors,
        code: this.errors[0].code,
        message: this.errors[0].message
      }
    };
  }
}
