/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  transpilePackages: ['firebase'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      undici: false,
    };
    return config;
  },
};

module.exports = nextConfig;
