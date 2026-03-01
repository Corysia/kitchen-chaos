import { AbstractMesh, Scene } from "@babylonjs/core";
import { Component } from "./Component";

export class VisualComponent extends Component {
  mesh!: AbstractMesh;

  constructor(private readonly meshFactory: (scene: Scene) => Promise<AbstractMesh>) {
    super();
  }

  async awake() {
    const scene = this.gameObject.transform.getScene();
    this.mesh = await this.meshFactory(scene);

    // parent mesh to the transform
    this.mesh.parent = this.gameObject.transform;
  }

  async destroy() {
    this.mesh.dispose();
  }
}