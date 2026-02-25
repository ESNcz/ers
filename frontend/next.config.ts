import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_WEB_DOMAIN: process.env.WEB_DOMAIN,
    NEXT_PUBLIC_API_DOMAIN: process.env.API_DOMAIN,
    PORT_FE: process.env.PORT_FE,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  turbopack: {
    root: __dirname,
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks", "@mantine/dates"],
  },
};

export default nextConfig;
