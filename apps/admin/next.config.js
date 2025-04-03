const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    reactStrictMode: true,
    transpilePackages: ["@repo/wrapper", "@repo/ui"],
};

module.exports = nextConfig;
