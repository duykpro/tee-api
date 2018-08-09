import { ErrorResponse } from "./responses";
import { Domain, Code, Reason, SourceType } from './constants/error';

export interface ErrorObject {
  domain: Domain;
  code: Code;
  reason: Reason;
  message: string;
  sourceType: SourceType;
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
