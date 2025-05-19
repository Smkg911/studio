import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Added for static export
  basePath: '/studio', // Added for GitHub Pages subpath
  trailingSlash: true, // Ensure trailing slashes for compatibility
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
