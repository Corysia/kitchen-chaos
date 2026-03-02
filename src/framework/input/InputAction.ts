/**
 * Enumeration of all possible input actions in the game.
 * These actions are mapped to keyboard keys through the InputSystem.
 */
export enum InputAction {
  MoveForward = "MoveForward",
  MoveBackward = "MoveBackward",
  MoveLeft = "MoveLeft",
  MoveRight = "MoveRight",
  Jump = "Jump",
}

/**
 * Type definition for mapping input actions to keyboard keys.
 * Each action is mapped to a keyboard key identifier (e.g., "KeyW", "Space").
 */
export type KeyBindingMap = {
  [action in InputAction]: string; // e.g. "KeyW", "Space"
};