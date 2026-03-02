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
  public name: string;
  
  /** The Babylon.js TransformNode that handles position, rotation, and scale */
  public transform: TransformNode;
  
  /** Array of components attached to this GameObject */
  public components: Component[] = [];
  
  /** Array of child GameObjects in the hierarchy */
  public children: GameObject[] = [];
  
  /** Reference to the parent GameObject, if this is a child */
  public parent?: GameObject;

  /** Flag indicating if awake has been called on this GameObject */
  public _awakeCalled = false;

  /** Flag indicating if start has been called on this GameObject */
  public _startCalled = false;

  /**
   * Creates a new GameObject instance
   * @param name The identifier for this GameObject
   * @param scene The Babylon.js scene to create the transform in
   */
  public constructor(name: string, scene: Scene) {
    this.name = name;
    this.transform = new TransformNode(name + "_transform", scene);
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