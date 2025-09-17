module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://api:8080/:path*",
      },
    ];
  },
};
