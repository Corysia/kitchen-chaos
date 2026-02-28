import { Engine } from "@babylonjs/core";
import { Stage } from "./Stage";
import { GameStage } from "../Stages/GameStage";

/**
 * Singleton manager for stage lifecycle and coordination.
 * Manages multiple stages, coordinates the main game loop, and handles stage transitions.
 * 
 * Key responsibilities:
 * - Stage creation and management
 * - Stage lifecycle coordination
 * - Game loop execution across all active stages
 * - Stage transitions and resource management
 */
export class StageManager {
    private static _instance: StageManager | null = null;

    /** The Babylon.js engine instance */
    public engine: Engine;
    
    /** Array of all active stages */
    public stages: Stage[] = [];
    
    /** The currently active stage */
    public activeStage: Stage | null = null;
    
    /** Flag indicating if the game has started */
    public started = false;

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
     * Adds a stage to the manager.
     * @param stage The stage to add
     */
    public addStage(stage: Stage): void {
        this.stages.push(stage);
    }

    /**
     * Removes a stage from the manager and disposes it.
     * @param stage The stage to remove
     */
    public removeStage(stage: Stage): void {
        const index = this.stages.indexOf(stage);
        if (index > -1) {
            this.stages.splice(index, 1);
            stage.dispose();
        }
    }

    /**
     * Sets the active stage.
     * @param stage The stage to make active
     */
    public setActiveStage(stage: Stage): void {
        if (this.activeStage) {
            this.activeStage.started = false;
        }
        this.activeStage = stage;
    }

    /**
     * Creates and initializes the main game stage.
     * Sets up the input system, creates the player GameObject, and starts the game loop.
     * @returns Promise that resolves when the stage is created and initialized
     */
    public async createGameStage(): Promise<Stage> {
        const gameStage = new GameStage();
        this.addStage(gameStage);
        this.setActiveStage(gameStage);
        await gameStage.initialize(this.engine);
        gameStage.start(); // Start the stage after initialization

        // start after first render
        gameStage.scene.onBeforeRenderObservable.add(() => {
            if (!this.started && gameStage.started) {
                this.started = true;
            }
        });

        // update loop
        gameStage.scene.onBeforeRenderObservable.add(() => {
            const dt = gameStage.scene.getEngine().getDeltaTime() / 1000;
            this.update(dt);
        });

        return gameStage;
    }

    /**
     * Updates all active stages.
     * Called every frame by the game loop.
     * @param dt Delta time in seconds since the last frame
     */
    public update(dt: number): void {
        this.stages.forEach(stage => {
            if (stage.started) {
                stage.update(dt);
            }
        });
    }

    /**
     * Gets the current active scene from the active stage.
     * @returns The active scene or null if no stage is active
     */
    public getActiveScene(): any {
        return this.activeStage?.scene || null;
    }
}