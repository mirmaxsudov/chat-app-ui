export interface ApiPaginationResponse<T> {
  success: boolean;
  message: string;
  results: T[];
  total: number;
  page: number;
  size: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  message: string;
  httpStatus: string;
  localDateTime: string;
  code: number;
}

export type ValidationErrors = Record<string, string>;
