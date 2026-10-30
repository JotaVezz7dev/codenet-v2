/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // <-- Descomentado, fundamental para o GitHub Pages!
  basePath: '/codenet-v2', // <-- Apontando para o repositório novo
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;