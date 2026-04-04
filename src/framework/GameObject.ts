import { Scene, TransformNode } from "@babylonjs/core";
import { Component } from "./components/Component";

/**
 * Represents a game object in the scene hierarchy.
 * GameObjects are containers for components and can be organized in parent-child relationships.
 * 
 * Key features:
 * - Component-based architecture for modular functionality
 * - Hierarchical parent-child relationships with transform inheritance
 * - Automatic lifecycle propagation to components and children
 * - Scene integration through Babylon.js TransformNode
 */
export class GameObject {
  /** The name/identifier for this GameObject */
  private _name: string;
  
  /** The Babylon.js TransformNode that handles position, rotation, and scale */
  private _transform: TransformNode;
  
  /** Array of components attached to this GameObject */
  private _components: Component[] = [];
  
  /** Array of child GameObjects in the hierarchy */
  private _children: GameObject[] = [];
  
  /** Reference to the parent GameObject, if this is a child */
  private _parent?: GameObject;

  /** Flag indicating if awake has been called on this GameObject */
  private _awakeCalled = false;

  /** Flag indicating if start has been called on this GameObject */
  private _startCalled = false;

  /**
   * Creates a new GameObject instance
   * @param name The identifier for this GameObject
   * @param scene The Babylon.js scene to create the transform in
   */
  public constructor(name: string, scene: Scene) {
    this._name = name;
    this._transform = new TransformNode(name + "_transform", scene);
  }

  /**
   * Gets the name/identifier for this GameObject
   * @returns The name of this GameObject
   */
  public get name(): string {
    return this._name;
  }

  /**
   * Sets the name/identifier for this GameObject
   * @param name The new name for this GameObject
   */
  public set name(name: string) {
    this._name = name;
  }

  /**
   * Gets the Babylon.js TransformNode that handles position, rotation, and scale
   * @returns The TransformNode for this GameObject
   */
  public get transform(): TransformNode {
    return this._transform;
  }

  /**
   * Sets the Babylon.js TransformNode that handles position, rotation, and scale
   * @param transform The new TransformNode for this GameObject
   */
  public set transform(transform: TransformNode) {
    this._transform = transform;
  }

  /**
   * Gets the array of components attached to this GameObject
   * @returns The components array
   */
  public get components(): Component[] {
    return this._components;
  }

  /**
   * Sets the array of components attached to this GameObject
   * @param components The new components array
   */
  public set components(components: Component[]) {
    this._components = components;
  }

  /**
   * Gets the array of child GameObjects in the hierarchy
   * @returns The children array
   */
  public get children(): GameObject[] {
    return this._children;
  }

  /**
   * Sets the array of child GameObjects in the hierarchy
   * @param children The new children array
   */
  public set children(children: GameObject[]) {
    this._children = children;
  }

  /**
   * Gets the reference to the parent GameObject, if this is a child
   * @returns The parent GameObject or undefined if none
   */
  public get parent(): GameObject | undefined {
    return this._parent;
  }

  /**
   * Sets the reference to the parent GameObject
   * @param parent The new parent GameObject or undefined
   */
  public set parent(parent: GameObject | undefined) {
    this._parent = parent;
  }

  /**
   * Gets the flag indicating if awake has been called on this GameObject
   * @returns True if awake has been called, false otherwise
   */
  public get awakeCalled(): boolean {
    return this._awakeCalled;
  }

  /**
   * Sets the flag indicating if awake has been called on this GameObject
   * @param awakeCalled True if awake has been called, false otherwise
   */
  public set awakeCalled(awakeCalled: boolean) {
    this._awakeCalled = awakeCalled;
  }

  /**
   * Gets the flag indicating if start has been called on this GameObject
   * @returns True if start has been called, false otherwise
   */
  public get startCalled(): boolean {
    return this._startCalled;
  }

  /**
   * Sets the flag indicating if start has been called on this GameObject
   * @param startCalled True if start has been called, false otherwise
   */
  public set startCalled(startCalled: boolean) {
    this._startCalled = startCalled;
  }

  /**
   * Adds a component to this GameObject
   * @param comp The component to add
   * @returns The added component
   */
  public addComponent<T extends Component>(comp: T): T {
    comp.gameObject = this;
    this.components.push(comp);
    comp.awake();
    return comp;
  }

  /**
   * Adds a child GameObject to this GameObject's hierarchy
   * Automatically removes the child from its previous parent if it has one
   * @param child The child GameObject to add
   */
  public addChild(child: GameObject): void {
    if (child.parent) {
      child.parent.children = child.parent.children.filter(c => c !== child);
    }
    child.parent = this;
    this.children.push(child);
    child.transform.parent = this.transform;
  }

  /**
   * Removes a child GameObject from this GameObject's hierarchy
   * @param child The child GameObject to remove
   */
  public removeChild(child: GameObject): void {
    this.children = this.children.filter(c => c !== child);
    child.parent = undefined;
    child.transform.parent = null;
  }

  // lifecycle dispatchers
  
  /**
   * Dispatches awake call to all components and children
   * Called when the GameObject is first initialized
   */
  public async awake(): Promise<void> { 
    if (this._awakeCalled) return;
    this._awakeCalled = true;
    
    const componentPromises = this.components
      .map(c => c.awake());
    
    const childPromises = this.children
      .map(child => child.awake());
    
    await Promise.all([...componentPromises, ...childPromises]);
  }
  
  /**
   * Dispatches start call to all components and children
   * Called once before the first frame update
   */
  public async start(): Promise<void> { 
    if (this._startCalled) return;
    this._startCalled = true;
    
    const componentPromises = this.components
      .map(c => c.start());
    
    const childPromises = this.children
      .map(child => child.start());
    
    await Promise.all([...componentPromises, ...childPromises]);
  }
  
  /**
   * Dispatches earlyUpdate call to all components and children
   * Called every frame before the main update
   * @param dt Delta time in seconds since the last frame
   */
  public async earlyUpdate(dt: number): Promise<void> { 
    const componentPromises = this.components
      .map(c => c.earlyUpdate?.(dt))
      .filter((promise): promise is Promise<void> => promise !== undefined);
    
    const childPromises = this.children
      .map(child => child.earlyUpdate(dt));
    
    await Promise.all([...componentPromises, ...childPromises]);
  }
  
  /**
   * Dispatches update call to all components and children
   * Called every frame for main game logic
   * @param dt Delta time in seconds since the last frame
   */
  public async update(dt: number): Promise<void> { 
    const componentPromises = this.components
      .map(c => c.update?.(dt))
      .filter((promise): promise is Promise<void> => promise !== undefined);
    
    const childPromises = this.children
      .map(child => child.update(dt));
    
    await Promise.all([...componentPromises, ...childPromises]);
  }
  
  /**
   * Dispatches lateUpdate call to all components and children
   * Called every frame after the main update
   * @param dt Delta time in seconds since the last frame
   */
  public async lateUpdate(dt: number): Promise<void> { 
    const componentPromises = this.components
      .map(c => c.lateUpdate?.(dt))
      .filter((promise): promise is Promise<void> => promise !== undefined);
    
    const childPromises = this.children
      .map(child => child.lateUpdate(dt));
    
    await Promise.all([...componentPromises, ...childPromises]);
  }
  
  /**
   * Dispatches destroy call to all components and children
   * Called when the GameObject is being removed from the scene
   */
  public async destroy(): Promise<void> {
    const componentPromises = this.components
      .map(c => c.destroy?.())
      .filter((promise): promise is Promise<void> => promise !== undefined);
    
    const childPromises = this.children
      .map(child => child.destroy());
    
    await Promise.all([...componentPromises, ...childPromises]);
    
    this.transform.dispose();
  }
}