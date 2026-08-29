/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POCKETBASE_URL: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_CARTO_BASEMAP_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
