import webpack from "webpack";

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "_next",
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // replace with your origin
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  images: {
    domains: [
      "www.pngall.com",
      "arifmia.netlify.app",
      "images.pexels.com",
      "localhost",
    ],
    unoptimized: true,
  },
  webpack5: true,
  webpack(config) {
    config.resolve.fallback = { fs: false };

    // Add DefinePlugin to avoid fluent-ffmpeg coverage issues
    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.FLUENTFFMPEG_COV": JSON.stringify(false),
      }),
    );

    return config;
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
