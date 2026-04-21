import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-dom/client", "lucide-react"],
  },
  ssr: {
    external: ["@react-router/node"],
    noExternal: ["lucide-react"],
  },
  build: {
    rollupOptions: {
      external: ["@react-router/node"],
    },
  },
});
