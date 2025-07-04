import { Observer, Scene } from "@babylonjs/core";
import { Entity } from "./Entity";
import { StageManager } from "./StageManager";
import { Logger } from "./Logger";

export class Node implements Entity {
    private _onBeforeRenderObserver: Observer<Scene> | undefined;
    private _onAfterRenderObserver: Observer<Scene> | undefined;
    private _enabled = true;
    public constructor() {
        Logger.debug("Node::constructor()");
        const scene = StageManager.instance.scene;
        this._onBeforeRenderObserver = scene.onBeforeRenderObservable.add(this.update);
        this._onAfterRenderObserver = scene.onAfterRenderObservable.add(this.lateUpdate);
        this.start();
    }

    public start(): void {
        Logger.debug("Node::start()");
    }

    public update(): void {
        Logger.debug("Node::update()");
        // TODO document why this method 'update' is empty
    }

    public lateUpdate(): void {
        Logger.debug("Node::lateUpdate()");
        // TODO:: document why this method 'lateUpdate' is empty
    }

    /**
     * Destroys the node.
     */
    public destroy(): void {
        Logger.debug("Node::destroy()");
        this.enabled = false;
        // TODO: isn't there a dispose that needs to be called?
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
        const scene = StageManager.instance.scene;
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