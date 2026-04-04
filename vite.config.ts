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
        resolve: {
            alias: {
                '@babylonjs/gui-editor/guiEditor.js': '@babylonjs/gui-editor/dist/babylon.guiEditor.js'
            }
        },
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
                treeshake: true,
                output: {
                    manualChunks(id) {
                        // Split BabylonJS core into its own chunk
                        if (id.includes('@babylonjs/core')) {
                            return 'babylon-core';
                        }
                        // Split inspector into separate chunk (dev-only)
                        if (id.includes('@babylonjs/inspector')) {
                            return 'babylon-inspector';
                        }
                        // Split framework code
                        if (id.includes('src/framework/StageManager') || 
                            id.includes('src/framework/GameObject') || 
                            id.includes('src/framework/Stage')) {
                            return 'framework';
                        }
                        // Split game-specific code
                        if (id.includes('src/Stages/GameStage') || 
                            id.includes('src/main')) {
                            return 'game';
                        }
                    }
                }
            }
        }
    }
})