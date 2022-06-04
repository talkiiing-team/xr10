import { defineConfig } from "vite";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    hmr: {
      clientPort: process.env.IS_HOSTED ? 443 : 3000,
    },
  },
});
