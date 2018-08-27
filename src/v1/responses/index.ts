import { Domain, Code, Reason, SourceType } from '../constants/error';

export type ListItemResponseMeta = {
  [k: string]: any;
}

export type ErrorObject = {
  domain: Domain;
  code: Code;
  reason: Reason;
  message: string;
  sourceType: SourceType;
  source: string;
}

export class ListItemResponse<T> {
  public items: ItemResponse<T>[];

  public constructor(public id: string, public kind: string, items: T[], public meta?: ListItemResponseMeta) {
    this.kind = `${this.kind}List`;
    this.items = items.map(item => {
      return new ItemResponse<T>(kind, item);
    });
  }
}

export class ItemResponse<T> {
  public constructor(public kind: string, data: T) {
    Object.assign(this, data);
  }
}

export class ErrorResponse extends Error {
  private errors: ErrorObject[];

  constructor(...errors: ErrorObject[]) {
    super(errors[0].message);

    this.errors = errors;
  }

  public getHTTPStatus(): number {
    return +this.errors[0].code;
  }

  public getResponse(): object {
    return {
      error: {
        errors: this.errors,
        code: this.errors[0].code,
        message: this.errors[0].message
      }
    };
  }
}
