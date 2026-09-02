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
