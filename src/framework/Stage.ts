import { Scene } from "@babylonjs/core";
import { GameObject } from "./GameObject";
import { Lifecycle } from "./interfaces/Lifecycle";

/**
 * Abstract base class for all game stages.
 * A stage represents a self-contained scene with its own GameObjects and lifecycle.
 * 
 * Key responsibilities:
 * - Scene management and lifecycle
 * - GameObject coordination within the stage
 * - Stage-specific initialization and cleanup
 */
export abstract class Stage implements Lifecycle {
    /** The Babylon.js scene for this stage */
    public scene!: Scene;
    
    /** Array of all active GameObjects in this stage */
    public gameObjects: GameObject[] = [];
    
    /** Flag indicating if the stage has started */
    public started = false;

    /** Flag indicating if awake has been called on this stage */
    public _awakeCalled = false;

    /** Flag indicating if start has been called on this stage */
    public _startCalled = false;

    /**
     * Called when the stage is created. Sets up initial state.
     * Default implementation calls awake on all GameObjects.
     */
    public async awake(): Promise<void> {
        if (this._awakeCalled) return;
        this._awakeCalled = true;

        const promises = this.gameObjects.map(go => go.awake());
        await Promise.all(promises);
    }

    /**
     * Called when the stage should start its game loop.
     * Sets up update loops and calls start on all GameObjects.
     */
    public async start(): Promise<void> {
        if (this._startCalled) return;
        this._startCalled = true;
        
        const promises = this.gameObjects.map(go => go.start());
        await Promise.all(promises);
        
        // Only set started to true after all start calls complete
        this.started = true;
    }

    /**
     * Updates all GameObjects in the stage.
     * Called every frame by the StageManager.
     * @param dt Delta time in seconds since the last frame
     */
    public async update(dt: number): Promise<void> {
        const promises = this.gameObjects.map(go => go.update(dt));
        await Promise.all(promises);
    }

    /**
     * Called early in the frame before update.
     * Calls earlyUpdate on all GameObjects.
     * @param dt Delta time in seconds since the last frame
     */
    public async earlyUpdate(dt: number): Promise<void> {
        const promises = this.gameObjects.map(go => go.earlyUpdate(dt));
        await Promise.all(promises);
    }

    /**
     * Called late in the frame after update.
     * Calls lateUpdate on all GameObjects.
     * @param dt Delta time in seconds since the last frame
     */
    public async lateUpdate(dt: number): Promise<void> {
        const promises = this.gameObjects.map(go => go.lateUpdate(dt));
        await Promise.all(promises);
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
    public async dispose(): Promise<void> {
        const promises = this.gameObjects.map(go => go.destroy());
        await Promise.all(promises);
        this.gameObjects = [];
        if (this.scene) {
            this.scene.dispose();
        }
    }
}
