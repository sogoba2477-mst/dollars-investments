import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.dollars.investments" }],
        destination: "https://dollars.investments/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

