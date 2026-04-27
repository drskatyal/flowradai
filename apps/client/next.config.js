const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // In development, Next.js internal chunks should not be split 
      // as it breaks HMR and leads to module resolution errors.
      if (dev) {
        return config;
      }

      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // Aggressively split ALL node_modules to stay under proxy limits
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            minSize: 20000,
            maxSize: 250000, // Target 250KB limit globally for libraries
            priority: 20,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
  // Enable standalone output for Electron packaging
  // Temporarily disabled due to Windows symlink permission issues
  // output: 'standalone',
};

// Allow dev server to start even if there are lint errors
const withLint = (config) => {
  return {
    ...config,
    eslint: {
      // Do not block dev/build on lint errors. CI should enforce lint.
      ignoreDuringBuilds: false,
    },
  };
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
  withLint,
];

module.exports = composePlugins(...plugins)(nextConfig);
