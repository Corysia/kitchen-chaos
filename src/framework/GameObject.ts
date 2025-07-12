import { Observer, Scene } from "@babylonjs/core";
import Lifecycle from "./interfaces/Lifecycle";
import { StageManager } from "./StageManager";
import { Logger } from "./Logger";
import Component from "./interfaces/Component";

export abstract class GameObject implements Lifecycle {
    private _onBeforeRenderObserver: Observer<Scene> | undefined;
    private _onAfterRenderObserver: Observer<Scene> | undefined;
    private _enabled = true;
    private _components: Array<Component> = new Array<Component>();
    private _id: string | undefined;

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

    /**
     * Gets the components associated with the GameObject.
     * 
     * This method returns a read-only array of components associated with the GameObject.
     * The array is not guaranteed to be in any particular order.
     * 
     * @type {Array<Component>}
     * @readonly
     * @memberof GameObject
     */
    public get components(): Array<Component> {
        return this._components;
    }

    /**
     * Retrieves the first component of the specified type from the game object.
     * 
     * This method searches the internal list of components and returns the first
     * component that is an instance of the specified component type, if any.
     * 
     * @template T - The type of component to retrieve.
     * @param {new() => T} componentType - The constructor function of the component type to retrieve.
     * @returns {T | undefined} The first component of the specified type, or undefined if no such component exists.
     */
    public getFirstComponentOfType<T extends Component>(componentType: new () => T): T | undefined {
        return this._components.find(component => component instanceof componentType) as T | undefined;
    }

    /**
     * Retrieves all components of the specified type from the game object.
     * 
     * This method filters the internal list of components and returns an array
     * containing all components that are instances of the specified component type.
     * 
     * @template T - The type of component to retrieve.
     * @param {new() => T} componentType - The constructor function of the component type to retrieve.
     * @returns {Array<T>} An array of components of the specified type.
     */
    public getAllComponentsOfType<T extends Component>(componentType: new () => T): Array<T> {
        return this._components.filter(component => component instanceof componentType) as Array<T>;
    }

    /**
     * Adds the specified component to the game object.
     * 
     * This method appends the specified component to the internal list of components.
     * 
     * @param {Component} component - The component to be added to the game object.
     * @returns {void}
     */
    public addComponent(component: Component): void {
        this._components.push(component);
    }

    /**
     * Removes the specified component from the game object.
     * 
     * This method filters out the given component from the internal list of components.
     * It also calls the destroy method on the component to clean up any resources it uses.
     * 
     * @param {Component} component - The component to remove from the game object.
     * @returns {void}
     */
    public removeComponent(component: Component): void {
        this._components = this._components.filter(c => c !== component);
    }

    /**
     * Gets the unique identifier of the GameObject.
     * 
     * This method returns the unique identifier of the GameObject, if any.
     * The unique identifier is a string that is used to identify the GameObject
     * within the scene.
     * 
     * @returns {string | undefined} The unique identifier of the GameObject, or undefined if no ID is set.
     */
    public get id(): string | undefined {
        return this._id;
    }

    /**
     * Sets the unique identifier of the GameObject.
     * 
     * @param {string} value - The unique identifier to set for the GameObject.
     * @memberof GameObject
     */
    public set id(value: string) {
        this._id = value;
    }
}