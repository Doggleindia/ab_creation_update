/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAIN_BACKEND: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
