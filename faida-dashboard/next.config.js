/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["fs", "path", "pdf-parse", "mammoth"],
  },
  // The public landing page is a static site in public/site. Serve it at "/".
  // The admin overview lives at /admin.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/site/index.html" }],
    };
  },
  async headers() {
    return [
      {
        source: "/site/fonts/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

module.exports = nextConfig;
