/** @type {import("next").NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "https://falls-highways-because-highs.trycloudflare.com/api/v1/:path*",
      },
    ]
  },
}
export default nextConfig;
