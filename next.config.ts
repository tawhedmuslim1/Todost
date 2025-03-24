/** @type {import('next').NextConfig} */
const nextConfig = {
  // Try disabling static page generation since that's where the error occurs
  output: "standalone",
  experimental: {
    // Minimize preprocessing during build
    optimizeCss: false,
  },
};

module.exports = nextConfig;

export const runtime =
  process.env.NODE_ENV === "development" ? "nodejs" : "edge";
