import { GameObject } from "../GameObject";
import { Lifecycle } from "../interfaces/Lifecycle";

/**
 * Abstract base class for all components in the game engine.
 * Components are the building blocks of game objects and contain the logic and behavior.
 * 
 * Important constraints:
 * - All components MUST be attached to a GameObject to function
 * - Components CANNOT have children components (use GameObject composition instead)
 * - Components implement the Lifecycle interface for game loop participation
 */
export abstract class Component implements Lifecycle {
  /** The GameObject this component is attached to. Must be set for component to function. */
  public gameObject!: GameObject;

  /**
   * Called when the component is initialized.
   * This method is optional and can be used to perform any necessary setup or initialization.
   */
  awake?(): Promise<void>;

  /**
   * Called when the component is started.
   * This method is optional and can be used to perform any necessary setup or initialization that requires the component to be fully initialized.
   */
  start?(): Promise<void>;

  /**
   * Called every frame, before the main update loop.
   * This method is optional and can be used to perform any necessary updates that require the component to be updated before the main update loop.
   * @param dt The time since the last frame, in seconds.
   */
  earlyUpdate?(dt: number): Promise<void>;

  /**
   * Called every frame, during the main update loop.
   * This method is optional and can be used to perform any necessary updates.
   * @param dt The time since the last frame, in seconds.
   */
  update?(dt: number): Promise<void>;

  /**
   * Called every frame, after the main update loop.
   * This method is optional and can be used to perform any necessary updates that require the component to be updated after the main update loop.
   * @param dt The time since the last frame, in seconds.
   */
  lateUpdate?(dt: number): Promise<void>;

  /**
   * Called when the component is being destroyed.
   * This method is optional and can be used to perform any necessary cleanup.
   */
  destroy?(): Promise<void>;
}