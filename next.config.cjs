module.exports = {
  async rewrites() {
    return [
      {
        source: "/imagex/:path*",
        destination: "https://www.printy6.com/imagex/:path*",
      },
    ];
  },
};
