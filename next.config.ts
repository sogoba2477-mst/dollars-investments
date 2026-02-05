import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
