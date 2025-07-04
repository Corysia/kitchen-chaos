import { Observer, Scene } from "@babylonjs/core";
import { Entity } from "./Entity";
import { StageManager } from "./StageManager";
import { Logger } from "./Logger";

export abstract class Node implements Entity {
    private _onBeforeRenderObserver: Observer<Scene> | undefined;
    private _onAfterRenderObserver: Observer<Scene> | undefined;
    private _enabled = true;

    /**
     * Constructs a new Node instance and initializes observers for
     * the scene's render events. The Node is set to start immediately
     * upon creation.
     *
     * @memberof Node
     */
    public constructor() {
        Logger.debug("Node::constructor()");
        const scene = StageManager.scene;
        this._onBeforeRenderObserver = scene.onBeforeRenderObservable.add(this.update);
        this._onAfterRenderObserver = scene.onAfterRenderObservable.add(this.lateUpdate);
        this.start();
    }

    /**
     * Starts the node.
     * 
     * This method is called once the node is enabled and the scene is ready.
     * It is meant to be overridden by subclasses to implement initialization
     * code that requires the scene to be ready.
     * 
     * @memberof Node
     */
    public start(): void {
        Logger.debug("Node::start()");
    }

    /**
     * Updates the node.
     * 
     * This method is called once every frame just before the scene is rendered.
     * It is meant to be overridden by subclasses to implement logic that
     * should be executed every frame.
     * 
     * @memberof Node
     */
    public update(): void {
        Logger.debug("Node::update()");
    }

    /**
     * Updates the node late.
     * 
     * This method is called once every frame just after the scene has been
     * rendered. It is meant to be overridden by subclasses to implement
     * logic that should be executed every frame after all other game logic
     * has been executed.
     * 
     * @memberof Node
     */
    public lateUpdate(): void {
        Logger.debug("Node::lateUpdate()");
    }

    /**
     * Destroys the node.
     * TODO: Implement this method to clean up any resources used by the node.
     */
    public destroy(): void {
        Logger.debug("Node::destroy()");
        this.enabled = false;
    }

    /**
     * Gets or sets whether the node is enabled.
     * If the node is disabled, it will not be updated or rendered.
     * 
     * @type {boolean}
     * @memberof Node
     */
    public set enabled(value: boolean) {
        Logger.debug(`Node::enabled(${value})`);
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