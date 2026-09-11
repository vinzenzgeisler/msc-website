import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const eventApiBaseUrl = loadEnv(mode, process.cwd(), "").VITE_EVENT_API_BASE_URL?.replace(/\/$/, "");

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      proxy: eventApiBaseUrl
        ? {
            "/event-api": {
              target: eventApiBaseUrl,
              changeOrigin: true,
              rewrite: (requestPath) => requestPath.replace(/^\/event-api/, ""),
            },
          }
        : undefined,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
