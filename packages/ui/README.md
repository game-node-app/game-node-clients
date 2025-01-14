# @repo/ui

## Objective
This folder contains common components and utilities to be used in all frontend projects.

## Usage
This project is *not* transpiled by default. That means the project calling it needs to compile it in order to use it.  
This basically means it can only be used in Typescript projects with a bundler capable of transpiling it.
(e.g.: NextJS, Vite, etc.)  

Example `next.config.js`:
```javascript
const path = require("path")

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/ui", "@repo/wrapper"], // the important bit
    experimental: {
        outputFileTracingRoot: path.join(__dirname, "../../"),
    },
};

module.exports = nextConfig;

```