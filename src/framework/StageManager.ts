import { Engine, MeshBuilder, Scene, FreeCamera, Vector3, HemisphericLight } from "@babylonjs/core";
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
        const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), this.scene);
        camera.setTarget(Vector3.Zero());
        camera.attachControl(this.engine.getRenderingCanvas(), true);

        // create light
        const light = new HemisphericLight("light1", new Vector3(0, 1, 0), this.scene);
        light.intensity = 0.7;

        // create ground
        MeshBuilder.CreateGround("ground", {width: 6, height: 6}, this.scene);

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
}