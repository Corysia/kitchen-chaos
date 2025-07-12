import { Camera, Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";
import { StageManager } from "./StageManager";
import { GameObject } from "./GameObject";
import { Logger } from "./Logger";
import { Lifecycle } from "./Lifecycle";

/**
 * The Stage class is an abstract class that provides a basic structure for creating and managing a BabylonJS scene.
 */
export abstract class Stage implements Lifecycle {

    private _camera: Camera | undefined;
    private _scene: Scene | undefined;
    private _gameObjects: Array<GameObject> = new Array<GameObject>();

    /**
     * Loads the scene asynchronously.
     *
     * Displays a loading UI and detaches control from the current scene.
     * Then it calls the createScene method to create the scene.
     * Finally, it hides the loading UI.
     *
     * @async
     * @returns {Promise<void>} Resolves when the scene has been loaded.
     */
    public async load(): Promise<void> {
        StageManager.engine.displayLoadingUI();
        StageManager.scene.detachControl();
        await this.createScene(StageManager.engine, StageManager.canvas);
        StageManager.engine.hideLoadingUI();
    }

    /**
     * Creates and returns a basic scene with a camera, light, sphere, and ground mesh.
     *
     * @param {Engine} engine The BabylonJS engine for the scene.
     * @param {HTMLCanvasElement} canvas The HTML canvas element to associate with the scene.
     *
     * @returns {Promise<Scene>} A promise that resolves with the created scene.
     */
    protected async createScene(engine: Engine, canvas: HTMLCanvasElement): Promise<Scene> {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new Scene(engine);

        // This creates and positions a free camera (non-mesh)
        const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);

        // This targets the camera to scene origin
        camera.setTarget(Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Our built-in 'sphere' shape. Params: name, options, scene
        const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);

        // Move the sphere upward 1/2 its height
        sphere.position.y = 1;

        // Our built-in 'ground' shape. Params: name, options, scene
        MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);

        return scene;
    }

    /**
     * Gets the camera associated with the stage.
     *
     * @returns {Camera | undefined} The camera associated with the stage, or undefined if the stage is not ready.
     */
    protected get camera(): Camera | undefined {
        return this._camera;
    }

    /**
     * Sets the camera associated with the stage.
     *
     * @param {Camera | undefined} value The camera to associate with the stage, or undefined to remove the camera.
     */
    protected set camera(value: Camera | undefined) {
        this._camera = value;
    }

    /**
     * Gets the BabylonJS scene associated with the stage.
     *
     * @returns {Scene | undefined} The scene associated with the stage, or undefined if the scene is not set.
     */
    public get scene(): Scene | undefined {
        return this._scene;
    }

    /**
     * Sets the BabylonJS scene associated with the stage.
     *
     * @param {Scene | undefined} value The scene to associate with the stage, or undefined to remove the scene.
     */
    public set scene(value: Scene | undefined) {
        this._scene = value;
    }

    /**
     * Adds a GameObject to the stage.
     *
     * This method appends the specified GameObject to the internal list of game objects.
     *
     * @param {GameObject} gameObject - The GameObject to be added to the stage.
     * @returns {void}
     */
    public addNode(gameObject: GameObject): void {
        this._gameObjects.push(gameObject);
    }

    /**
     * Removes the specified GameObject from the stage.
     *
     * This method filters out the given GameObject from the internal list of game objects.
     * It also calls the destroy method on the GameObject to clean up any resources it uses.
     *
     * @param {GameObject} gameObject - The GameObject to remove from the stage.
     */
    public removeNode(gameObject: GameObject): void {
        this._gameObjects = this._gameObjects.filter(n => n !== gameObject);
        gameObject.destroy();
    }

    /**
     * Calls the awake method on all GameObjects in the stage.
     *
     * This method is called once the stage is initialized and ready.
     * It is meant to be overridden by subclasses to implement logic
     * that should be executed once the stage becomes active and
     * all GameObjects are prepared.
     *
     * @memberof Stage
     */
    awake(): void {
        Logger.debug("Stage::awake()");
        for (const gameObject of this._gameObjects) {
            gameObject.awake();
        }
    }

    /**
     * Starts all GameObjects in the stage.
     *
     * This method calls the start method on all GameObjects in the stage. It is
     * meant to be overridden by subclasses to implement logic that should be
     * executed once all GameObjects have been initialized.
     *
     * @memberof Stage
     */
    start(): void {
        Logger.debug("Stage::start()");
        for (const gameObject of this._gameObjects) {
            gameObject.start();
        }
    }

    /**
     * Calls the update method on all GameObjects in the stage.
     *
     * This method is called once every frame just before the scene is rendered.
     * It is meant to be overridden by subclasses to implement logic that
     * should be executed every frame.
     * 
     * @memberof Stage
     */
    update(): void {
        Logger.debug("Stage::update()");
        for (const gameObject of this._gameObjects) {
            gameObject.update();
        }
    }

    /**
     * Calls the lateUpdate method on all GameObjects in the stage.
     *
     * This method is called once every frame just after the scene has been rendered.
     * It is meant to be overridden by subclasses to implement logic that
     * should be executed every frame after all other game logic has been executed.
     * 
     * @memberof Stage
     */
    lateUpdate(): void {
        Logger.debug("Stage::lateUpdate()");
        for (const gameObject of this._gameObjects) {
            gameObject.lateUpdate();
        }
    }
}