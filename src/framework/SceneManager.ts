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
export class SceneManager {
    private static _instance: SceneManager | null = null;

    /** The Babylon.js engine instance */
    engine: Engine;
    
    /** The main game scene */
    scene!: Scene;
    
    /** Array of all active GameObjects in the scene */
    gameObjects: GameObject[] = [];
    
    /** Flag indicating if the game has started */
    started = false;
    
    /** Global input system for handling user input */
    inputSystem!: InputSystem;

    /**
     * Creates a new SceneManager instance (singleton pattern)
     * @param engine The Babylon.js engine to use
     * @throws Error if an instance already exists
     */
    constructor(engine: Engine) {
        if (SceneManager._instance) {
            throw new Error("SceneManager instance already exists");
        }
        SceneManager._instance = this;
        this.engine = engine;
    }

    /**
     * Gets the singleton SceneManager instance
     * @returns The SceneManager instance
     * @throws Error if SceneManager has not been initialized
     */
    static get instance(): SceneManager {
        if (!SceneManager._instance) {
            throw new Error("SceneManager has not been initialized");
        }
        return SceneManager._instance;
    }

    /**
     * Creates and initializes the main game scene.
     * Sets up the input system, creates the player GameObject, and starts the game loop.
     * @returns The created Scene instance
     */
    createScene(): Scene {
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
    createPlayer(): GameObject {
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