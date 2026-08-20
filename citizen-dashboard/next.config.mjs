/** @type {import("next").NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://34.69.13.74:8000/api/v1/:path*",
      },
    ]
  },
}
export default nextConfig;