/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  optimizeFonts: false,
  webpack: (config, { isServer }) => {
    // Handle optional dependencies for ElevenLabs SDK (these are optional peer dependencies)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      encoding: false,
      bufferutil: false,
      'utf-8-validate': false,
    };
    
    // Ignore these modules during bundling (they're optional)
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        encoding: false,
        bufferutil: false,
        'utf-8-validate': false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
