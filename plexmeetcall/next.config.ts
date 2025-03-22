import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: [
      "@mui/material",
      "socket.io-client",
      "react-player",
      "peerjs",
    ],
  },
  // These packages are being traced but aren't needed in the standalone build
  // This reduces the size while keeping functionality
  transpilePackages: [
    "@swc/core",
    "react",
    "react-dom",
    "@mui/material",
    "next",
    "socket.io",
    "socket.io-client",
    "peerjs",
    "simple-peer",
    "react-player",
  ],
};

export default nextConfig;
