/** @type {import("next").NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "https://showtimes-newton-memorial-dice.trycloudflare.com/api/v1/:path*",
      },
    ]
  },
}
export default nextConfig;
