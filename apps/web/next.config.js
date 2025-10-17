import withAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["@repo/wrapper", "@repo/ui", "@repo/analytics"],
  experimental: {
    optimizePackageImports: ["@tabler/icons-react"],
    turbopackFileSystemCacheForDev: true,
  },
  reactCompiler: true,
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

const withBundleAnalyzer = withAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
