"use strict";

// next.config.js
var nextConfig = {
  transpilePackages: ["firebase"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      undici: false
    };
    return config;
  },
  async rewrites() {
    const backendBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendBase}/api/:path*`
      }
    ];
  }
};
module.exports = nextConfig;
