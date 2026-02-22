import { KeyboardEventTypes, Scene } from "@babylonjs/core";
import { InputAction, KeyBindingMap } from "./InputAction";


const defaultBindings: KeyBindingMap = {
  MoveForward: "KeyW",
  MoveBackward: "KeyS",
  MoveLeft: "KeyA",
  MoveRight: "KeyD",
  Jump: "Space",
};

export class InputSystem {
  private readonly scene: Scene;
  private bindings: KeyBindingMap;
  private readonly keyState: Set<string> = new Set();

  // listeners: action → callbacks
  private readonly listeners: Map<InputAction, Set<(active: boolean) => void>> = new Map();

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

  private dispatch(key: string, active: boolean) {
    for (const action in this.bindings) {
      if (this.bindings[action as InputAction] === key) {
        const callbacks = this.listeners.get(action as InputAction)!;
        callbacks.forEach(cb => cb(active));
      }
    }
  }

  on(action: InputAction, callback: (active: boolean) => void) {
    this.listeners.get(action)!.add(callback);
  }

  off(action: InputAction, callback: (active: boolean) => void) {
    this.listeners.get(action)!.delete(callback);
  }

  setBindings(newBindings: KeyBindingMap) {
    this.bindings = newBindings;
  }

  // optional: per-frame polling
  isActive(action: InputAction): boolean {
    const key = this.bindings[action];
    return this.keyState.has(key);
  }
}