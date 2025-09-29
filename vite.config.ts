import build from "@hono/vite-build/cloudflare-workers";
import { defaultOptions as buildDefaultOptions } from "@hono/vite-build/cloudflare-workers";
import adapter from "@hono/vite-dev-server/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import honox from "honox/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    honox({
      devServer: {
        adapter,
      },
      client: { input: ["/app/client.ts", "/app/style.css"] },
    }),
    tailwindcss(),
    build({
      entry: "./worker/index.ts", // Workerのエントリーポイントを指定
      entryContentAfterHooks: [
        ...(buildDefaultOptions.entryContentAfterHooks ?? []),
        () => `export { GameRoom } from "./worker/durable-objects/GameRoom"`,
      ],
    }),
  ],
  build: {
    rollupOptions: {
      external: ["cloudflare:workers"],
    },
  },
});
