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
  name: string;
  
  /** The Babylon.js TransformNode that handles position, rotation, and scale */
  transform: TransformNode;
  
  /** Array of components attached to this GameObject */
  components: Component[] = [];
  
  /** Array of child GameObjects in the hierarchy */
  children: GameObject[] = [];
  
  /** Reference to the parent GameObject, if this is a child */
  parent?: GameObject;

  /**
   * Creates a new GameObject instance
   * @param name The identifier for this GameObject
   * @param scene The Babylon.js scene to create the transform in
   */
  constructor(name: string, scene: Scene) {
    this.name = name;
    this.transform = new TransformNode(name + "_transform", scene);
  }

  /**
   * Adds a component to this GameObject
   * @param comp The component to add
   * @returns The added component
   */
  addComponent<T extends Component>(comp: T): T {
    comp.gameObject = this;
    this.components.push(comp);
    return comp;
  }

  /**
   * Adds a child GameObject to this GameObject's hierarchy
   * Automatically removes the child from its previous parent if it has one
   * @param child The child GameObject to add
   */
  addChild(child: GameObject): void {
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
  removeChild(child: GameObject): void {
    this.children = this.children.filter(c => c !== child);
    child.parent = undefined;
    child.transform.parent = null;
  }

  // lifecycle dispatchers
  
  /**
   * Dispatches awake call to all components and children
   * Called when the GameObject is first initialized
   */
  awake() { 
    this.components.forEach(c => c.awake?.());
    this.children.forEach(child => child.awake());
  }
  
  /**
   * Dispatches start call to all components and children
   * Called once before the first frame update
   */
  start() { 
    this.components.forEach(c => c.start?.());
    this.children.forEach(child => child.start());
  }
  
  /**
   * Dispatches earlyUpdate call to all components and children
   * Called every frame before the main update
   * @param dt Delta time in seconds since the last frame
   */
  earlyUpdate(dt: number) { 
    this.components.forEach(c => c.earlyUpdate?.(dt));
    this.children.forEach(child => child.earlyUpdate(dt));
  }
  
  /**
   * Dispatches update call to all components and children
   * Called every frame for main game logic
   * @param dt Delta time in seconds since the last frame
   */
  update(dt: number) { 
    this.components.forEach(c => c.update?.(dt));
    this.children.forEach(child => child.update(dt));
  }
  
  /**
   * Dispatches lateUpdate call to all components and children
   * Called every frame after the main update
   * @param dt Delta time in seconds since the last frame
   */
  lateUpdate(dt: number) { 
    this.components.forEach(c => c.lateUpdate?.(dt));
    this.children.forEach(child => child.lateUpdate(dt));
  }
  
  /**
   * Dispatches destroy call to all components and children
   * Called when the GameObject is being removed from the scene
   */
  destroy() {
    this.components.forEach(c => c.destroy?.());
    this.children.forEach(child => child.destroy());
    this.transform.dispose();
  }
}