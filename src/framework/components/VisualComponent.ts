import { AbstractMesh, Scene } from "@babylonjs/core";
import { Component } from "./Component";

/**
 * Represents a visual component that can be attached to a GameObject.
 * It creates and manages a mesh using a provided factory function.
 */
export class VisualComponent extends Component {
  /**
   * The mesh created by the component.
   */
  private mesh!: AbstractMesh;

  /**
   * Creates a new VisualComponent with a mesh factory function
   * @param meshFactory Function that creates the mesh when the component awakens
   */
  public constructor(private readonly meshFactory: (scene: Scene) => Promise<AbstractMesh>) {
    super();
  }

  /**
   * Initializes the component by creating the mesh using the factory function
   * Parents the mesh to the GameObject's transform
   */
  public async awake() {
    await super.awake();
    
    const scene = this.gameObject.transform.getScene();
    this.mesh = await this.meshFactory(scene);

    // parent mesh to the transform
    this.mesh.parent = this.gameObject.transform;
  }

  /**
   * Cleans up the component by disposing the mesh
   */
  public async destroy() {
    this.mesh.dispose();
    await super.destroy?.();
  }
}