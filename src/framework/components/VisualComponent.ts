import { AbstractMesh, Scene } from "@babylonjs/core";
import { Component } from "./Component";

export class VisualComponent extends Component {
  mesh!: AbstractMesh;

  constructor(private readonly meshFactory: (scene: Scene) => AbstractMesh) {
    super();
  }

  awake() {
    const scene = this.gameObject.transform.getScene();
    this.mesh = this.meshFactory(scene);

    // parent mesh to the transform
    this.mesh.parent = this.gameObject.transform;
  }

  destroy() {
    this.mesh.dispose();
  }
}