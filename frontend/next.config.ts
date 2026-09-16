import type { NextConfig } from "next";

// Rewrites are resolved at build time - in Docker pass API_INTERNAL_URL as build arg
const apiUrl = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  // reactCompiler: true,
  env: {
    NEXT_PUBLIC_WEB_DOMAIN: process.env.WEB_DOMAIN,
    PORT_FE: process.env.PORT_FE,
  },
  // Serve the API under the web origin so the auth cookie is first-party (sameSite lax, no CORS)
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiUrl}/:path*` }];
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
