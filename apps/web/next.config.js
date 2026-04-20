import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  outputFileTracingIncludes: {
    "/*": [
      "../../node_modules/@reduxjs/toolkit/**/*",
      "../../node_modules/immer/**/*",
      "../../node_modules/react-redux/**/*",
      "../../node_modules/redux/**/*",
      "../../node_modules/reselect/**/*",
      "../../node_modules/use-sync-external-store/**/*",
      "../../node_modules/recharts/**/*",
    ],
  },
  reactStrictMode: true,
  i18n: {
    locales: ["en", "pt-BR"],
    defaultLocale: "en",
  },
  transpilePackages: [
    "@repo/wrapper",
    "@repo/ui",
    "@repo/analytics",
    "@repo/locales",
  ],
  experimental: {
    optimizePackageImports: ["@tabler/icons-react"],
    turbopackFileSystemCacheForDev: true,
  },
  reactCompiler: true,
  redirects() {
    return [
      {
        source: "/admin",
        destination: "https://admin.gamenode.app",
        permanent: true,
      },
      {
        source: "/search",
        destination: "/home",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
