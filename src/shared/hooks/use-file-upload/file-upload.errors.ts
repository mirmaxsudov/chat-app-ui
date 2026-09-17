export type FileUploadErrorCode =
  | 'AUTH_REQUIRED'
  | 'CANCELLED'
  | 'EMPTY_FILE'
  | 'FILE_TOO_LARGE'
  | 'INVALID_SERVER_RESPONSE'
  | 'UPLOAD_IN_PROGRESS';

export class FileUploadError extends Error {
  readonly code: FileUploadErrorCode;

  constructor(code: FileUploadErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'FileUploadError';
    this.code = code;
  }
}
