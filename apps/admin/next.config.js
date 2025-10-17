/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@tabler/icons-react"],
    reactCompiler: true,
  },
  transpilePackages: ["@repo/wrapper", "@repo/ui", "@repo/analytics"],
};

module.exports = nextConfig;
