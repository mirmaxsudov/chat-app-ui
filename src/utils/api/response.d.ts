interface ApiPaginationResponse<T> {
  success: boolean;
  message: string;
  results: T[];
  total: number;
  page: number;
  size: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiError {
  message: string;
  httpStatus: string;
  localDateTime: string;
  code: number;
}

type ValidationErrors = Record<string, string>;
