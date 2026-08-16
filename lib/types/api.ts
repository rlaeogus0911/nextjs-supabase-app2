export interface ApiError {
  message: string;
  code?: string;
}

export type ApiResponse<T> = { data: T; error: null } | { data: null; error: ApiError };

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
