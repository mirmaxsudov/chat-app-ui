interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_TUS_UPLOAD_CHUNK_SIZE?: string;
  readonly VITE_TUS_UPLOAD_RETRY_INTERVAL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
