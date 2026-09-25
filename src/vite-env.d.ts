/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POCKETBASE_URL: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_CARTO_BASEMAP_KEY?: string;
  readonly VITE_ENABLE_RACEPIC?: string;
  readonly VITE_EVENT_API_BASE_URL?: string;
  readonly VITE_RACEPIC_CDN_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
