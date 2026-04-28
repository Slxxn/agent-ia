/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://192.168.169/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
