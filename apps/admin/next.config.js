/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["@repo/wrapper", "@repo/ui", "@repo/analytics"],
  experimental: {
    optimizePackageImports: ["@tabler/icons-react"],
    turbopackFileSystemCacheForDev: true,
  },
  reactCompiler: false,
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
