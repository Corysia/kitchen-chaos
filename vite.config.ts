import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/kitchen-chaos/',
    build: {
        minify: true,
        rollupOptions: {
            onwarn(warning, warn) {
                // Suppress "use client" directive warnings
                if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                    return
                }
                warn(warning)
            }
        }
    }
})