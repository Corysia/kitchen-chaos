import { InputSystem } from "../input/InputSystem";
import { Component } from "./Component";
import { StageManager } from "../StageManager";
import { GameStage } from "../../Stages/GameStage";
import { InputAction } from "../input/InputAction";

export class CharacterMovementComponent extends Component {
  input!: InputSystem;
  speed = 5;

  awake() {
    // get the InputSystem from the active GameStage
    const activeStage = StageManager.instance.activeStage;
    
    if (activeStage && activeStage instanceof GameStage) {
      this.input = activeStage.inputSystem;
    } else {
      throw new Error("No active GameStage found or active stage is not a GameStage");
    }

    this.input.on(InputAction.MoveForward, active => this.forward = active);
    this.input.on(InputAction.MoveBackward, active => this.backward = active);
    this.input.on(InputAction.MoveLeft, active => this.left = active);
    this.input.on(InputAction.MoveRight, active => this.right = active);
    this.input.on(InputAction.Jump, active => {
      if (active) this.jumpRequested = true;
    });
  }

  forward = false;
  backward = false;
  left = false;
  right = false;
  jumpRequested = false;

  update(dt: number) {
    const t = this.gameObject.transform;

    let dx = 0;
    let dz = 0;

    if (this.forward) dz += 1;
    if (this.backward) dz -= 1;
    if (this.left) dx -= 1;
    if (this.right) dx += 1;

    const len = Math.hypot(dx, dz);
    if (len > 0) {
      dx /= len;
      dz /= len;
    }

    t.position.x += dx * this.speed * dt;
    t.position.z += dz * this.speed * dt;

    if (this.jumpRequested) {
      // do jump logic
      this.jumpRequested = false;
    }
  }
}