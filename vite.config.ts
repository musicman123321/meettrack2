export default defineConfig({
  base: "/", // Set this to absolute root

  plugins: [
    react({
      plugins: conditionalPlugins,
    }),
    tempo(),
  ],

  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    // @ts-ignore
    allowedHosts: true,
    historyApiFallback: true, // Add this
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`,
      },
    },
  },
});
