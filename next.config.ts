import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/devloper",
        destination: "/partner",
        permanent: true,
      },
      {
        source: "/devloper/:path*",
        destination: "/partner/:path*",
        permanent: true,
      },
      {
        source: "/developer",
        destination: "/partner",
        permanent: true,
      },
      {
        source: "/developer/:path*",
        destination: "/partner/:path*",
        permanent: true,
      },
      {
        source: "/developers",
        destination: "/partner",
        permanent: true,
      },
      {
        source: "/developers/:path*",
        destination: "/partner/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
