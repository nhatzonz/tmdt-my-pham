export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type ApiErrorPayload = {
  code: string;
  message: string;
  errors?: Record<string, string>;
};
