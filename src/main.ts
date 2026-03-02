import { Engine, Scene } from "@babylonjs/core";
import { Logger as BabylonLoggerClass } from "@babylonjs/core/Misc/logger";
import "@babylonjs/inspector";
import { StageManager } from "./framework/StageManager";
import { GameStage } from "./Stages/GameStage";
import { Logger, LogLevel, LogTimestampFormat } from "./framework/logger/Logger";

/**
 * Main class for the Kitchen Chaos Babylon.js game
 * Handles canvas creation, engine initialization, and StageManager setup
 */
class Main {
    private engine!: Engine;
    private canvas!: HTMLCanvasElement;
    private stageManager!: StageManager;

    /**
     * Initializes game by creating canvas, engine, and StageManager
     * Sets up event listeners and starts render loop
     */
    public async initialize(): Promise<void> {
        try {
            Logger.setTimestampFormat(LogTimestampFormat.ISO);
            Logger.setLogLevel(LogLevel.TRACE);
            
            // Set BabylonJS logger to DEBUG level equivalent
            // In production, only show errors and warnings from BabylonJS
            if (import.meta.env.PROD) {
                BabylonLoggerClass.LogLevels = 1; // ERROR level only
            } else {
                BabylonLoggerClass.LogLevels = 4; // DEBUG level in development
            }
            
            this.canvas = document.createElement("canvas");
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.tabIndex = 0; // Make canvas focusable
            document.body.appendChild(this.canvas);
            this.canvas.focus(); // Ensure canvas has focus for input
            
            // Add click listener to ensure canvas stays focused
            this.canvas.addEventListener('click', () => {
                this.canvas.focus();
            });
            this.engine = new Engine(this.canvas, true);
            
            // Display loading screen immediately
            // Shows Babylon.js default loading UI while stage initializes
            this.engine.displayLoadingUI();
            
            // Initialize StageManager
            this.stageManager = StageManager.initialize(this.engine);
            
            // Create and setup GameStage
            const gameStage = new GameStage();
            gameStage.engine = this.engine; // Set engine reference
            this.stageManager.addStage(gameStage);
            await this.stageManager.setActiveStage(gameStage); // Set as active BEFORE initialization
            
            // Use lifecycle methods for initialization
            await gameStage.awake();
            await gameStage.start();
            
            // Set up update loop only after all initialization is complete
            gameStage.scene.onBeforeRenderObservable.add(async () => {
                const dt = gameStage.scene.getEngine().getDeltaTime() / 1000;
                await this.stageManager.update(dt);
            });
            
            const scene = gameStage.scene;
            
            // Hide loading screen - stage is ready to render
            // Hides Babylon.js loading UI after all initialization is complete
            this.engine.hideLoadingUI();
            
            this.onSceneCreated(scene);
            
            Logger.info('Game initialized successfully');
        } catch (error) {
            Logger.error('Failed to initialize game', error);
            
            // Display user-friendly error message
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #ff4444;
                color: white;
                padding: 20px;
                border-radius: 8px;
                font-family: Arial, sans-serif;
                text-align: center;
                z-index: 1000;
            `;
            errorDiv.innerHTML = `
                <h2>Game Initialization Failed</h2>
                <p>${errorMessage}</p>
                <button onclick="location.reload()" style="
                    background: white;
                    color: #ff4444;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 10px;
                ">Reload</button>
            `;
            document.body.appendChild(errorDiv);
            
            // Hide loading screen even if initialization failed
            // Ensures loading UI doesn't remain visible on error
            this.engine.hideLoadingUI();
            
            throw error;
        }
    }

    /**
     * Called when scene is successfully created
     * Sets up event listeners, and starts rendering
     * @param scene The created Babylon.js scene
     */
    private onSceneCreated(scene: Scene): void {
        this.setupEventListeners();

        this.engine.runRenderLoop(() => {
            scene.render();
        });
    }

    /**
     * Sets up global event listeners for window resize and keyboard shortcuts
     * Handles fullscreen toggle and debug layer visibility
     */
    private setupEventListeners(): void {
        globalThis.addEventListener("resize", () => {
            this.engine.resize();
        });

        globalThis.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+F
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.code === "KeyF") {
                this.engine.switchFullscreen(false);
            }
            // Shift+Ctrl+Alt+I
            if (!import.meta.env.PROD) {
                if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.code === "KeyI") {
                    const activeScene = this.stageManager.getActiveScene();
                    if (activeScene?.debugLayer.isVisible()) {
                        activeScene.debugLayer.hide();
                    } else if (activeScene) {
                        activeScene.debugLayer.show();
                    }
                }
            } 
        });
    }
}

const main = new Main();
main.initialize();
