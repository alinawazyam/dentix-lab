import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  
  // Correct config for Prisma
  serverExternalPackages: ['@prisma/client'],
  
  // Allow dev origins for preview
  allowedDevOrigins: [
    'preview-chat-ac6544a6-19ce-4610-985c-59f95c56870c.space.z.ai',
  ],
};

export default nextConfig;
