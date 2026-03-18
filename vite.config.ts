import { defineConfig, loadEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Check if debug mode is enabled via environment or mode
    const env = loadEnv(mode, process.cwd(), '');
    const isDebugMode = mode === 'development' || 
                        env.VITE_DEBUG === 'true' || 
                        env.DEBUG === 'true';

    return {
        base: '/kitchen-chaos/',
        build: {
            minify: 'terser',
            terserOptions: {
                compress: {
                    // Only remove console logs if not in debug mode
                    drop_console: !isDebugMode,
                    drop_debugger: !isDebugMode,
                    pure_funcs: isDebugMode ? [] : ['console.log', 'console.debug', 'console.info']
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
    }
})