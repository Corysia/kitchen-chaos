import { Engine, MeshBuilder, Scene, FreeCamera, Vector3, HemisphericLight, DirectionalLight, StandardMaterial, Texture, GroundMesh } from "@babylonjs/core";
import { GameObject } from "./GameObject";
import { VisualComponent } from "./components/VisualComponent";
import { CharacterMovementComponent } from "./components/CharacterMovement";
import { InputSystem } from "./input/InputSystem";

/**
 * Singleton manager for the game scene and GameObject lifecycle.
 * Coordinates the main game loop, input system, and GameObject management.
 * 
 * Key responsibilities:
 * - Scene creation and management
 * - GameObject lifecycle coordination
 * - Input system initialization
 * - Game loop execution with proper timing
 */
export class StageManager {
    private static _instance: StageManager | null = null;

    /** The Babylon.js engine instance */
    public engine: Engine;
    
    /** The main game scene */
    public scene!: Scene;
    
    /** Array of all active GameObjects in the scene */
    public gameObjects: GameObject[] = [];
    
    /** Flag indicating if the game has started */
    public started = false;
    
    /** Global input system for handling user input */
    public inputSystem!: InputSystem;

    /**
     * Creates a new StageManager instance (singleton pattern)
     * @param engine The Babylon.js engine to use
     * @throws Error if an instance already exists
     */
    private constructor(engine: Engine) {
        if (StageManager._instance) {
            throw new Error("StageManager instance already exists");
        }
        StageManager._instance = this;
        this.engine = engine;
    }

    /**
     * Gets the singleton StageManager instance
     * @returns The StageManager instance
     * @throws Error if StageManager has not been initialized
     */
    public static get instance(): StageManager {
        if (!StageManager._instance) {
            throw new Error("StageManager has not been initialized");
        }
        return StageManager._instance;
    }

    /**
     * Initializes the singleton StageManager instance
     * @param engine The Babylon.js engine to use
     * @returns The initialized StageManager instance
     * @throws Error if an instance already exists
     */
    public static initialize(engine: Engine): StageManager {
        if (StageManager._instance) {
            throw new Error("StageManager instance already exists");
        }
        const instance = new StageManager(engine);
        return instance;
    }

    /**
     * Creates and initializes the main game scene.
     * Sets up the input system, creates the player GameObject, and starts the game loop.
     * @returns The created Scene instance
     */
    public createScene(): Scene {
        this.scene = new Scene(this.engine);

        // initialize input system
        this.inputSystem = new InputSystem(this.scene);

        // create camera
        const camera = new FreeCamera("camera1", new Vector3(0, 10, -10), this.scene);

        // This targets the camera to scene origin
        camera.setTarget(Vector3.Zero());

        // camera.attachControl(this.engine.getRenderingCanvas(), true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const hemlight = new HemisphericLight("light1", new Vector3(0, 1, 0), this.scene);

        // Default intensity is 1. Let's dim the light a small amount
        hemlight.intensity = 0.7;

        // light1
        const light = new DirectionalLight("dir01", new Vector3(50, -30, 0), this.scene);
        light.position = new Vector3(0, 180, -20);
        light.intensity = 0.5;

        this.createGround(50, 50, './textures/ButtonBackground.png', 50, 50);

        // create player
        const player = this.createPlayer();
        this.gameObjects.push(player);

        // call awake on all objects
        this.gameObjects.forEach(go => go.awake());

        // start after first render
        this.scene.onBeforeRenderObservable.add(() => {
            if (!this.started) {
                this.started = true;
                this.gameObjects.forEach(go => go.start());
            }
        });

        // update loop
        this.scene.onBeforeRenderObservable.add(() => {
            const dt = this.scene.getEngine().getDeltaTime() / 1000;

            this.gameObjects.forEach(go => go.earlyUpdate(dt));
            this.gameObjects.forEach(go => go.update(dt));
            this.gameObjects.forEach(go => go.lateUpdate(dt));
        });

        return this.scene;
    }

    /**
     * Creates and configures the player GameObject.
     * Sets up the player with a visual component (box mesh) and basic positioning.
     * @returns The configured player GameObject
     */
    public createPlayer(): GameObject {
        const player = new GameObject("Player", this.scene);

        // attach visual
        player.addComponent(new VisualComponent(scene => {
            const mesh = MeshBuilder.CreateBox("PlayerVisual", {}, scene);
            mesh.position.y = 1;
            return mesh;
        }));

        // attach movement
        player.addComponent(new CharacterMovementComponent());

        return player;
    }

        /**
     * Creates and returns a standard material with a diffuse texture for the ground.
     * The texture is scaled to repeat tileX times along the U axis and tileY times along the V axis.
     *
     * @param {string} textureUrl The URL of the diffuse texture.
     * @param {number} tileX The number of times to repeat the texture along the U axis.
     * @param {number} tileY The number of times to repeat the texture along the V axis.
     *
     * @returns {StandardMaterial} The created ground material with the applied texture.
     */
    private createGroundMaterial(textureUrl: string, tileX: number, tileY: number): StandardMaterial {
        const groundTexture = new Texture(textureUrl, this.scene);
        groundTexture.uScale = tileX;
        groundTexture.vScale = tileY;

        const groundMaterial = new StandardMaterial("groundMaterial", this.scene);
        groundMaterial.diffuseTexture = groundTexture;
        return groundMaterial;
    }

    /**
     * Creates and returns a ground mesh with a standard material that has a diffuse texture.
     * The ground mesh is created with MeshBuilder.CreateGround() and the texture is scaled to repeat tileX times along the U axis and tileY times along the V axis.
     *
     * @param {number} width The width of the ground mesh.
     * @param {number} height The height of the ground mesh.
     * @param {string} textureUrl The URL of the diffuse texture.
     * @param {number} tileX The number of times to repeat the texture along the U axis.
     * @param {number} tileY The number of times to repeat the texture along the V axis.
     *
     * @returns {GroundMesh} The created ground mesh.
     */
    private createGround(width: number, height: number, textureUrl: string, tileX: number, tileY: number): GroundMesh {
        const ground = MeshBuilder.CreateGround("ground", { width: width, height: height }, this.scene);
        ground.position = Vector3.Zero();
        ground.material = this.createGroundMaterial(textureUrl, tileX, tileY);
        ground.receiveShadows = true;
        return ground;
    }
}