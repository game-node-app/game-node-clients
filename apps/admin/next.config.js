const path = require("path");

module.exports = {
    output: "standalone",
    reactStrictMode: true,
    transpilePackages: ["@repo/ui", "@repo/wrapper"],
    experimental: {
        outputFileTracingRoot: path.join(__dirname, "../../"),
    },
};
