/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["fs", "path", "pdf-parse", "mammoth"],
  },
};

module.exports = nextConfig;
