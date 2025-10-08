/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ISSUANCE_API_URL: string
  readonly VITE_VERIFICATION_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
