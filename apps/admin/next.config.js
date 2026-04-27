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
};

// Ensure ESLint runs during the build
const withLint = (config) => {
  return {
    ...config,
    eslint: {
      // This will error and stop the build when linting issues are found
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
