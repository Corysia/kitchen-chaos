export enum InputAction {
  MoveForward = "MoveForward",
  MoveBackward = "MoveBackward",
  MoveLeft = "MoveLeft",
  MoveRight = "MoveRight",
  Jump = "Jump",
}

export type KeyBindingMap = {
  [action in InputAction]: string; // e.g. "KeyW", "Space"
};