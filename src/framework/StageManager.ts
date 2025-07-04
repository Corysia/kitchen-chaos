import { Engine, FreeCamera, Scene, Vector3 } from "@babylonjs/core";
import { Logger } from "./Logger";
import { Stage } from "./Stage";

export class StageManager {

    private static _instance: StageManager;
    private _currentScene: Scene;
    private readonly _engine: Engine;
    private readonly _canvas: HTMLCanvasElement;
    private readonly _stageMap: Map<string, Stage>;

    /**
     * Creates a new StageManager instance.
     *
     * This constructor creates a canvas element if there is none, and an engine
     * and scene. It also adds an event listener for resizing the window.
     *
     * @see StageManager.createCanvas
     * @see StageManager.createEngine
     * @see StageManager.createPlaceholderScene
     * @see StageManager.resize
     */
    public constructor() {
        Logger.debug("StageManager::constructor()");
        this._canvas = StageManager.createCanvas();
        this._engine = StageManager.createEngine(this._canvas);
        this._currentScene = StageManager.createPlaceholderScene(this._engine);
        this._stageMap = new Map<string, Stage>();

        window.addEventListener("resize", function () {
            StageManager.resize();
        });
    }

    /**
     * Creates and appends a new HTML canvas element to the document body.
     * If a canvas with the id "canvas" already exists, it is removed before creating a new one.
     * The canvas is styled to occupy the full width and height of its parent.
     *
     * @returns {HTMLCanvasElement} The created canvas element.
     */
    private static createCanvas(): HTMLCanvasElement {
        document.getElementById("canvas")?.remove();
        const canvas = document.createElement("canvas");
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.id = "canvas";
        document.body.appendChild(canvas);
        return canvas;
    }

    /**
     * Creates a BabylonJS Engine instance using the provided canvas.
     * Throws an error if the canvas is null or undefined.
     * 
     * @param {HTMLCanvasElement} canvas - The HTML canvas element to associate with the engine.
     * @returns {Engine} The created BabylonJS engine.
     * @throws Will throw an error if the engine creation fails.
     */
    private static createEngine(canvas: HTMLCanvasElement): Engine {
        if (canvas == null || canvas === undefined) {
            throw new Error("Canvas is null or undefined");
        }// TODO: create a WebGPU engine if possible, fall back to webgl
        try {
            return new Engine(canvas, true);
        } catch (error) {
            Logger.error("Error creating engine:" + error);
            throw error;
        }
    }

    /**
     * Creates a placeholder scene with a camera at (0, 5, -10)
     * and a target at scene origin (0, 0, 0).
     *
     * @param {Engine} engine The BabylonJS engine for the scene.
     * @returns {Scene} A placeholder scene with a camera and target.
     */
    private static createPlaceholderScene(engine: Engine): Scene {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new Scene(engine);

        // This creates and positions a free camera (non-mesh)
        const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);

        // This targets the camera to scene origin
        camera.setTarget(Vector3.Zero());

        return scene;
    }

    /**
     * Gets the StageManager singleton instance.
     *
     * @returns {StageManager} The StageManager instance.
     */
    public static get instance(): StageManager {
        if (!StageManager._instance) {
            StageManager._instance = new StageManager();
        }

        return StageManager._instance;
    }

    /**
     * Resizes the Babylon engine to match the current window size.
     * This function is called automatically when the window is resized.
     * 
     * @returns void
     */
    private static resize(): void {
        StageManager.instance._engine.resize();
    }

    /**
     * Gets the BabylonJS engine associated with the StageManager.
     * 
     * @returns {Engine} The BabylonJS engine associated with the StageManager.
     */
    public static get engine(): Engine {
        return StageManager._instance._engine;
    }

    /**
     * Gets the BabylonJS Scene associated with the StageManager.
     * 
     * @returns {Scene} The BabylonJS Scene associated with the StageManager.
     */
    public static get scene(): Scene {
        return StageManager._instance._currentScene;
    }

    /**
     * Gets the HTMLCanvasElement associated with the StageManager.
     * 
     * @returns {HTMLCanvasElement} The HTMLCanvasElement associated with the StageManager.
     */
    public static get canvas(): HTMLCanvasElement {
        return StageManager._instance._canvas;
    }

    /**
     * Starts the render loop and animations.
     * 
     * This function must be called after the scene has been created and all
     * resources have been loaded. If the render loop fails to start, the
     * error is reported to the Logger.
     * 
     * @returns void
     */
    public static startRenderLoop() {
        try {
            StageManager.engine.runRenderLoop(() => {
                StageManager.scene.render();
            });
        } catch (error) {
            Logger.error("Failed to start render loop:", error);
            Logger.trace(error);
        }
    }


    /**
     * Stops the render loop and animations.
     * 
     * This function must be called after the render loop has been started.
     * If the render loop fails to stop, the error is reported to the Logger.
     * 
     * @returns void
     */

    public static stopRenderLoop() {
        try {
            StageManager.engine.stopRenderLoop();
        } catch (error) {
            Logger.error("Failed to stop render loop:", error);
            Logger.trace(error);
        }

        // TODO: stop animations
        // try {
        //     StageManager.instance.scene.stopAnimation();
        // } catch (error) {
        //     Logger.error("Failed to stop animations:", error);
        //     Logger.trace(error);
        // }
    }


    /**
     * Sets the active stage in the StageManager to the given name.
     * If the stage does not exist, it logs an error and does not change the active stage.
     * If the stage is not loaded, it loads the stage and then sets it as the active stage.
     * If the stage is loaded, it switches to that stage and starts the render loop.
     * If the stage is not loaded and cannot be loaded, it logs an error and does not change the active stage.
     * If the stage is loaded but cannot be set as the active stage, it logs an error and does not change the active stage.
     * 
     * @param {string} name - The name of the stage to be set as the active stage.
     * @returns {Promise<void>} Resolves when the stage has been set as the active stage.
     */
    public static async setActiveStage(name: string): Promise<void> {
        const stage = StageManager.findStage(name);
        if (stage != undefined) {
            let scene = stage.scene;
            if (scene == undefined) {
                await stage.load();
                if (stage.scene == undefined) {
                    Logger.error("Stage not loaded: ", name);
                    return;
                }
                else
                    scene = stage.scene;
            }
            const oldScene = StageManager.scene;
            StageManager.stopRenderLoop();
            oldScene.dispose();
            StageManager.instance._currentScene = scene;
            StageManager.startRenderLoop();
        }
        else Logger.error("Stage not found: ", name);
    }

    /**
     * Finds a stage by its name in the StageManager's stage map.
     * 
     * @param {string} name - The name of the stage to be found.
     * 
     * @returns {Stage | undefined} The found stage, or undefined if no stage is found.
     */
    public static findStage(name: string): Stage | undefined {
        Logger.debug("StageManager::findStage(): ", name);
        return StageManager.instance._stageMap.get(name);
    }

    /**
     * Adds a new stage to the StageManager's stage map.
     * 
     * @param {string} name - The name of the stage to be added.
     * @param {Stage} stage - The stage instance to be added.
     * 
     * @returns {void}
     */
    public static addStage(name: string, stage: Stage): void {
        Logger.debug("StageManager::addStage(): ", name);
        StageManager.instance._stageMap.set(name, stage);
    }
}