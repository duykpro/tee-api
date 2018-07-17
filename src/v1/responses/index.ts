import { ErrorObject } from "../error";

export interface ItemResponse {
  id: string;
}

export interface ListItemResponse {
  id: string;
  data: any[];
}

export interface ErrorResponse {
  error: {
    errors: ErrorObject[];
    code: string;
    message: string;
  }
}
