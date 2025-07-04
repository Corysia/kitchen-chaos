import { Camera, Engine, FreeCamera, HemisphericLight, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";
import { StageManager } from "./StageManager";

export abstract class Stage {

    private _camera: Camera | undefined;

    private _scene: Scene | undefined;

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

    protected get camera(): Camera | undefined {
        return this._camera;
    }
    protected set camera(value: Camera | undefined) {
        this._camera = value;
    }

    public get scene(): Scene | undefined {
        return this._scene;
    }
    public set scene(value: Scene | undefined) {
        this._scene = value;
    }
}