import { Observer, Scene } from "@babylonjs/core";
import { Lifecycle } from "./Lifecycle";
import { StageManager } from "./StageManager";
import { Logger } from "./Logger";

export abstract class GameObject implements Lifecycle {
    private _onBeforeRenderObserver: Observer<Scene> | undefined;
    private _onAfterRenderObserver: Observer<Scene> | undefined;
    private _enabled = true;

    /**
     * Constructs a new GameObject instance and initializes observers for
     * the scene's render events. The GameObject is set to start immediately
     * upon creation.
     *
     * @memberof GameObject
     */
    public constructor() {
        Logger.debug("GameObject::constructor()");
        const scene = StageManager.scene;
        this._onBeforeRenderObserver = scene.onBeforeRenderObservable.add(this.update);
        this._onAfterRenderObserver = scene.onAfterRenderObservable.add(this.lateUpdate);
    }

    /**
     * Called once the GameObject is enabled and the scene is ready.
     * Override this method to implement initialization code that
     * requires the scene to be ready.
     *
     * @memberof GameObject
     */
    public awake(): void {
        Logger.debug("GameObject::awake()");
    }

    /**
     * Starts the GameObject.
     * 
     * This method is called once the GameObject is enabled and the scene is ready.
     * It is meant to be overridden by subclasses to implement initialization
     * code that requires the scene to be ready.
     * 
     * @memberof GameObject
     */
    public start(): void {
        Logger.debug("GameObject::start()");
    }

    /**
     * Updates the GameObject.
     * 
     * This method is called once every frame just before the scene is rendered.
     * It is meant to be overridden by subclasses to implement logic that
     * should be executed every frame.
     * 
     * @memberof GameObject
     */
    public update(): void {
        Logger.debug("GameObject::update()");
    }

    /**
     * Updates the GameObject late.
     * 
     * This method is called once every frame just after the scene has been
     * rendered. It is meant to be overridden by subclasses to implement
     * logic that should be executed every frame after all other game logic
     * has been executed.
     * 
     * @memberof GameObject
     */
    public lateUpdate(): void {
        Logger.debug("GameObject::lateUpdate()");
    }

    /**
     * Destroys the GameObject.
     * TODO: Implement this method to clean up any resources used by the GameObject.
     */
    public destroy(): void {
        Logger.debug("GameObject::destroy()");
        this.enabled = false;
        if (this._onBeforeRenderObserver) {
            StageManager.scene.onBeforeRenderObservable.remove(this._onBeforeRenderObserver);
            this._onBeforeRenderObserver = undefined;
        }
        if (this._onAfterRenderObserver) {
            StageManager.scene.onAfterRenderObservable.remove(this._onAfterRenderObserver);
            this._onAfterRenderObserver = undefined;
        }
        this._onBeforeRenderObserver = undefined;
        this._onAfterRenderObserver = undefined;
        // If the object has a mesh, that will need to be removed from the scene
    }

    /**
     * Gets or sets whether the GameObject is enabled.
     * If the GameObject is disabled, it will not be updated or rendered.
     * 
     * @type {boolean}
     * @memberof GameObject
     */
    public set enabled(value: boolean) {
        Logger.debug(`GameObject::enabled(${value})`);
        const scene = StageManager.scene;
        if (this._enabled === value) {
            return;
        }
        if (value) {
            this._onBeforeRenderObserver = scene.onBeforeRenderObservable.add(this.update);
            this._onAfterRenderObserver = scene.onAfterRenderObservable.add(this.lateUpdate);
        } else {
            if (this._onBeforeRenderObserver) {
                scene.onBeforeRenderObservable.remove(this._onBeforeRenderObserver);
                this._onBeforeRenderObserver = undefined;
            }
            if (this._onAfterRenderObserver) {
                scene.onAfterRenderObservable.remove(this._onAfterRenderObserver);
                this._onAfterRenderObserver = undefined;
            }
        }
        this._enabled = value;
    }
}