/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['firebase'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
  webpack: (config) => {
    // Firebase Storage's Node build imports undici which uses private class fields
    // incompatible with Next.js webpack. Alias it to false so Firebase falls back
    // to the global fetch (available in Node 18+ and all browsers).
    config.resolve.alias = {
      ...config.resolve.alias,
      undici: false,
    };
    return config;
  },
};

module.exports = nextConfig;
