import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/kitchen-chaos/',
    build: {
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.debug', 'console.info']
            }
        },
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            onwarn(warning, warn) {
                // Suppress "use client" directive warnings
                if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                    return
                }
                warn(warning)
            },
            treeshake: 'smallest',
            output: {
                manualChunks: {
                    // Split BabylonJS core into its own chunk
                    'babylon-core': ['@babylonjs/core'],
                    // Split inspector into separate chunk (dev-only)
                    'babylon-inspector': ['@babylonjs/inspector'],
                    // Split framework code
                    'framework': [
                        './src/framework/StageManager',
                        './src/framework/GameObject',
                        './src/framework/Stage'
                    ],
                    // Split game-specific code
                    'game': [
                        './src/Stages/GameStage',
                        './src/main'
                    ]
                }
            }
        }
    }
})