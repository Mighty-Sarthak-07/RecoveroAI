import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/agent",
        destination: "/simulation",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
