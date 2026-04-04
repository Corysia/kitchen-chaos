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

  /** Flag indicating if awake has been called on this component */
  public _awakeCalled = false;

  /** Flag indicating if start has been called on this component */
  public _startCalled = false;

  /**
   * Called when the component is initialized.
   * This method is optional and can be used to perform any necessary setup or initialization.
   */
  public async awake(): Promise<void> {
    if (this._awakeCalled) return;
    this._awakeCalled = true;
  }

  /**
   * Called when the component is started.
   * This method is optional and can be used to perform any necessary setup or initialization that requires the component to be fully initialized.
   */
  public async start(): Promise<void> {
    if (this._startCalled) return;
    this._startCalled = true;
  }

  /**
   * Called every frame, before the main update loop.
   * This method is optional and can be used to perform any necessary updates that require the component to be updated before the main update loop.
   * @param dt The time since the last frame, in seconds.
   */
  public earlyUpdate?(dt: number): Promise<void>;

  /**
   * Called every frame, during the main update loop.
   * This method is optional and can be used to perform any necessary updates.
   * @param dt The time since the last frame, in seconds.
   */
  public update?(dt: number): Promise<void>;

  /**
   * Called every frame, after the main update loop.
   * This method is optional and can be used to perform any necessary updates that require the component to be updated after the main update loop.
   * @param dt The time since the last frame, in seconds.
   */
  public lateUpdate?(dt: number): Promise<void>;

  /**
   * Called when the component is being destroyed.
   * This method is optional and can be used to perform any necessary cleanup.
   */
  public destroy?(): Promise<void>;
}