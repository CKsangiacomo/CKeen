/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [],
  },
  async redirects() {
    return [
      // Ensure /studio loads the static host shell in /public/studio/index.html
      { source: "/studio", destination: "/studio/index.html", permanent: true },
    ];
  },
  headers: async () => [{
    source: "/(.*)",
    headers: [
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy", value: "default-src 'self'; frame-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;" }
    ]
  }]
};

export default nextConfig;
