import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // Load VITE_ vars from apps/lite/.env.local (or .env)
  const env = loadEnv(mode, __dirname, 'VITE_');

  return {
    root: __dirname,
    publicDir: resolve(__dirname, '../client/public'),

    plugins: [
      react(),
      viteSingleFile({
        removeViteModuleLoader: true,
        useRecommendedBuildConfig: true,
      }),
    ],

    resolve: {
      alias: {
        // Map @/ to the client source tree so all existing imports work
        '@': resolve(__dirname, '../client/src'),

        // Shim Next.js browser APIs
        'next/navigation': resolve(__dirname, 'src/shims/next-navigation'),
        'next/link': resolve(__dirname, 'src/shims/next-link'),
        'next/image': resolve(__dirname, 'src/shims/next-image'),
        'next/script': resolve(__dirname, 'src/shims/next-script'),

        // Real Clerk — @clerk/nextjs is aliased to @clerk/clerk-react (no server middleware)
        '@clerk/nextjs': '@clerk/clerk-react',

        // Override lib/axios so it reads VITE_ env vars instead of NEXT_PUBLIC_ ones
        '@/lib/axios': resolve(__dirname, 'src/lib/axios'),

        // Shims directory lives in apps/lite/src/shims, not apps/client/src/shims
        '@/shims': resolve(__dirname, 'src/shims'),
      },
    },

    define: {
      // Let any residual process.env.NEXT_PUBLIC_* references resolve at build time
      'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(env.VITE_API_URL ?? ''),
      'process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': JSON.stringify(
        env.VITE_CLERK_PUBLISHABLE_KEY ?? ''
      ),
    },

    build: {
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
      // Don't inline any file as a data URL — WASM/ONNX are fetched at runtime by the
      // VAD library and never enter the Rollup asset pipeline, so this only affects
      // small SVGs/fonts. Set to 0 so nothing unexpected gets base64-embedded.
      assetsInlineLimit: 0,
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
        output: {
          // Single JS chunk — this is what vite-plugin-singlefile then inlines into HTML
          inlineDynamicImports: true,
        },
      },
    },

    css: {
      postcss: resolve(__dirname, 'postcss.config.js'),
    },
  };
});
