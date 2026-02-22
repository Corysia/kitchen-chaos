import { Engine, Scene } from "@babylonjs/core";
import { Logger as BabylonLoggerClass } from "@babylonjs/core/Misc/logger";
import "@babylonjs/inspector";
import { SceneManager } from "./framework/SceneManager";
import { Logger, LogLevel, LogTimestampFormat } from "./framework/logger/Logger";

/**
 * Main class for the Kitchen Chaos Babylon.js game
 * Handles canvas creation, engine initialization, and SceneManager setup
 */
class Main {
    private engine!: Engine;
    private canvas!: HTMLCanvasElement;
    private sceneManager!: SceneManager;

    /**
     * Initializes game by creating canvas, engine, and SceneManager
     * Sets up event listeners and starts render loop
     */
    public initialize(): void {
        Logger.setTimestampFormat(LogTimestampFormat.ISO);
        Logger.setLogLevel(LogLevel.DEBUG);
        
        // Set BabylonJS logger to DEBUG level equivalent
        // In production, only show errors and warnings from BabylonJS
        if (import.meta.env.PROD) {
            BabylonLoggerClass.LogLevels = 1; // ERROR level only
        } else {
            BabylonLoggerClass.LogLevels = 3; // DEBUG level in development
        }
        
        this.canvas = document.createElement("canvas");
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        document.body.appendChild(this.canvas);
        this.engine = new Engine(this.canvas, true);
        
        // Initialize SceneManager
        this.sceneManager = SceneManager.initialize(this.engine);
        const scene = this.sceneManager.createScene();
        
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
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.code === "KeyI") {
                if (this.sceneManager.scene.debugLayer.isVisible()) {
                    this.sceneManager.scene.debugLayer.hide();
                } else {
                    this.sceneManager.scene.debugLayer.show();
                }
            }
        });
    }
}

const main = new Main();
main.initialize();
