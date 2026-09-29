interface ApiPaginationResponse<T> {
  hasNext: boolean;
  hasPrev: boolean;
  message: string;
  page: number;
  results: T[];
  size: number;
  success: boolean;
  total: number;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

interface ApiError {
  code: number;
  httpStatus: string;
  localDateTime: string;
  message: string;
}

type ValidationErrors = Record<string, string>;
