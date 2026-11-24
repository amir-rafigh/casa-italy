import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  redirects() {
    return [{ source: "/Menu", destination: "/", permanent: true }];
  },
  turbopack: {
    rules: {
      "*.css": {
        // Preserve native CSS Module scoping and class-name exports.
        condition: { not: { path: "*.module.css" } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
