import { KeyboardEventTypes, Scene } from "@babylonjs/core";
import { InputAction, KeyBindingMap } from "./InputAction";

/**
 * Default key bindings for input actions.
 * Maps each action to a default keyboard key.
 */
const defaultBindings: KeyBindingMap = {
  MoveForward: "KeyW",
  MoveBackward: "KeyS",
  MoveLeft: "KeyA",
  MoveRight: "KeyD",
  Jump: "Space",
};

/**
 * Manages keyboard input and maps keys to game actions.
 * Provides event-based callbacks and polling for input state.
 */
export class InputSystem {
  private readonly scene: Scene;
  private bindings: KeyBindingMap;
  private readonly keyState: Set<string> = new Set();

  // listeners: action → callbacks
  private readonly listeners: Map<InputAction, Set<(active: boolean) => void>> = new Map();

  /**
   * Creates a new InputSystem with the specified scene and key bindings.
   * @param scene The Babylon.js scene to attach input listeners to
   * @param bindings Optional custom key bindings, defaults to WASD + Space
   */
  constructor(scene: Scene, bindings: KeyBindingMap = defaultBindings) {
    this.scene = scene;
    this.bindings = bindings;

    // initialize listener sets
    Object.values(InputAction).forEach(action => {
      this.listeners.set(action, new Set());
    });

    this.scene.onKeyboardObservable.add(info => {
      const key = info.event.code;

      if (info.type === KeyboardEventTypes.KEYDOWN) {
        this.keyState.add(key);
        this.dispatch(key, true);
      }

      if (info.type === KeyboardEventTypes.KEYUP) {
        this.keyState.delete(key);
        this.dispatch(key, false);
      }
    });
  }

  /**
   * Dispatches input events to registered callbacks
   * @param key The keyboard key that triggered the event
   * @param active Whether the key is pressed (true) or released (false)
   */
  private dispatch(key: string, active: boolean) {
    for (const action in this.bindings) {
      if (this.bindings[action as InputAction] === key) {
        const callbacks = this.listeners.get(action as InputAction)!;
        callbacks.forEach(cb => cb(active));
      }
    }
  }

  /**
   * Registers a callback for a specific input action
   * @param action The input action to listen for
   * @param callback Function to call when the action state changes
   */
  on(action: InputAction, callback: (active: boolean) => void) {
    this.listeners.get(action)!.add(callback);
  }

  /**
   * Unregisters a callback for a specific input action
   * @param action The input action to stop listening for
   * @param callback The callback function to remove
   */
  off(action: InputAction, callback: (active: boolean) => void) {
    this.listeners.get(action)!.delete(callback);
  }

  /**
   * Updates the key bindings for input actions
   * @param newBindings New mapping of input actions to keyboard keys
   */
  setBindings(newBindings: KeyBindingMap) {
    this.bindings = newBindings;
  }

  // optional: per-frame polling
  /**
   * Checks if an input action is currently active
   * @param action The input action to check
   * @returns True if the action is currently active, false otherwise
   */
  isActive(action: InputAction): boolean {
    const key = this.bindings[action];
    return this.keyState.has(key);
  }
}