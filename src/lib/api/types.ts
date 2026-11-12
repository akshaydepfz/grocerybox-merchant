/**
 * Shared API response envelopes.
 * Field names and shapes will align with the Go backend once extracted from Flutter.
 */

export type ApiSuccessResponse<T> = {
  data: T;
};

export type ApiErrorBody = {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
};

export type ApiListMeta = {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
};

export type ApiListResponse<T> = {
  data: T[];
  meta?: ApiListMeta;
};

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | undefined;

  constructor(message: string, status: number, body?: ApiErrorBody) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export type AuthorizationHeaderProvider = () =>
  | string
  | null
  | undefined
  | Promise<string | null | undefined>;
