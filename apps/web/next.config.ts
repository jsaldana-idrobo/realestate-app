/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: "http://api:8080/api/v1/:path*",
      },
    ];
  },
};
module.exports = nextConfig;
