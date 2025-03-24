const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["@repo/wrapper", "@repo/ui"],
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "https://admin.gamenode.app",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
