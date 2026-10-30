/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/codenet-v2',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
