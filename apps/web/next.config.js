/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compile the shared workspace TypeScript package (@kt/types ships .ts source)
  transpilePackages: ["@kt/types"],
  images: {
    // Restrict the image optimizer to known CDNs/buckets instead of allowing
    // any remote host (which is an SSRF/abuse surface). Add specific hosts here
    // if product images are served from another origin.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
  },
};

module.exports = nextConfig;
