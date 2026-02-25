import { Engine, Scene } from "@babylonjs/core";
import { Logger as BabylonLoggerClass } from "@babylonjs/core/Misc/logger";
import "@babylonjs/inspector";
import { StageManager } from "./framework/StageManager";
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
        Logger.setTimestampFormat(LogTimestampFormat.ISO);
        Logger.setLogLevel(LogLevel.TRACE);
        
        // Set BabylonJS logger to DEBUG level equivalent
        // In production, only show errors and warnings from BabylonJS
        // TODO: re-enable this later
        // if (import.meta.env.PROD) {
            // BabylonLoggerClass.LogLevels = 1; // ERROR level only
        // } else {
            // BabylonLoggerClass.LogLevels = 4; // DEBUG level in development
            BabylonLoggerClass.LogLevels = 7; // ALL level in development
        // }
        
        this.canvas = document.createElement("canvas");
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        document.body.appendChild(this.canvas);
        this.engine = new Engine(this.canvas, true);
        
        // Initialize StageManager
        this.stageManager = StageManager.initialize(this.engine);
        const scene = await this.stageManager.createScene();
        
        this.onSceneCreated(scene);
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
            // TODO: re-enable this later
            // if (!import.meta.env.PROD) {
                if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.code === "KeyI") {
                    if (this.stageManager.scene.debugLayer.isVisible()) {
                        this.stageManager.scene.debugLayer.hide();
                    } else {
                        this.stageManager.scene.debugLayer.show();
                    }
                }
            // } 
        });
    }
}

const main = new Main();
main.initialize();
