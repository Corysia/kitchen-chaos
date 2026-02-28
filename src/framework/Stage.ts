import { Scene } from "@babylonjs/core";
import { GameObject } from "./GameObject";

/**
 * Abstract base class for all game stages.
 * A stage represents a self-contained scene with its own GameObjects and lifecycle.
 * 
 * Key responsibilities:
 * - Scene management and lifecycle
 * - GameObject coordination within the stage
 * - Stage-specific initialization and cleanup
 */
export abstract class Stage {
    /** The Babylon.js scene for this stage */
    public scene!: Scene;
    
    /** Array of all active GameObjects in this stage */
    public gameObjects: GameObject[] = [];
    
    /** Flag indicating if the stage has started */
    public started = false;

    /**
     * Initializes the stage and creates its scene.
     * Must be implemented by concrete stage classes.
     * @param engine The Babylon.js engine to use for scene creation
     * @returns Promise that resolves when the stage is fully initialized
     */
    public abstract initialize(engine: any): Promise<void>;

    /**
     * Called when the stage should start its game loop.
     * Sets up update loops and calls start on all GameObjects.
     */
    public start(): void {
        if (this.started) return;
        
        this.started = true;
        this.gameObjects.forEach(go => go.start());
    }

    /**
     * Updates all GameObjects in the stage.
     * Called every frame by the StageManager.
     * @param dt Delta time in seconds since the last frame
     */
    public update(dt: number): void {
        this.gameObjects.forEach(go => go.earlyUpdate(dt));
        this.gameObjects.forEach(go => go.update(dt));
        this.gameObjects.forEach(go => go.lateUpdate(dt));
    }

    /**
     * Adds a GameObject to this stage.
     * @param gameObject The GameObject to add
     */
    public addGameObject(gameObject: GameObject): void {
        this.gameObjects.push(gameObject);
    }

    /**
     * Removes a GameObject from this stage.
     * @param gameObject The GameObject to remove
     */
    public removeGameObject(gameObject: GameObject): void {
        const index = this.gameObjects.indexOf(gameObject);
        if (index > -1) {
            this.gameObjects.splice(index, 1);
            gameObject.destroy();
        }
    }

    /**
     * Cleans up the stage and disposes of all resources.
     */
    public dispose(): void {
        this.gameObjects.forEach(go => go.destroy());
        this.gameObjects = [];
        if (this.scene) {
            this.scene.dispose();
        }
    }
}
