/// <reference types="vite/client" />

declare module 'vite/client' {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
    // Add other environment variables here as needed
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Also declare at global scope for compatibility
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

