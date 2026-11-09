/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["fs", "path", "pdf-parse", "mammoth"],
  },
  // The public site is static, in public/site: the organisations page at "/" and the
  // people page at "/people". The admin overview lives at /admin.
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/site/index.html" },        // organisations (main page)
        { source: "/people", destination: "/site/people.html" }, // people
      ],
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
