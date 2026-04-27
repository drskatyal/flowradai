const path = require('path');

module.exports = {
  plugins: {
    // Explicitly point at our own tailwind config so Tailwind doesn't accidentally
    // pick up apps/client/tailwind.config.js (which requires Nx helpers)
    tailwindcss: { config: path.resolve(__dirname, 'tailwind.config.js') },
    autoprefixer: {},
  },
};
