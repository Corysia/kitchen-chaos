/**
 * Defines the lifecycle interface for components in the game engine.
 * All components can implement these methods to participate in the game loop.
 * Methods support both synchronous and asynchronous execution.
 * 
 * Execution order:
 * - awake() (once, when component is created)
 * - start() (once, before first frame)
 * - earlyUpdate() → update() → lateUpdate() (every frame, in order)
 * - destroy() (once, when component is removed)
 */
export interface Lifecycle {

  /**
   * Called once when the component is first created and added to a GameObject.
   * Use this for initialization that doesn't depend on other components.
   * Called before start().
   */
  awake?(): void | Promise<void>;

  /**
   * Called once before the first frame update, after all components have been awoken.
   * Use this for initialization that may depend on other components.
   */
  start?(): void | Promise<void>;

  /**
   * Called every frame before the main update.
   * Use for physics calculations or other early-frame processing.
   * @param dt - Delta time in seconds since the last frame
   */
  earlyUpdate?(dt: number): void | Promise<void>;

  /**
   * Called every frame for main game logic.
   * Use for gameplay mechanics, AI, input handling, etc.
   * @param dt - Delta time in seconds since the last frame
   */
  update?(dt: number): void | Promise<void>;

  /**
   * Called every frame after the main update.
   * Use for cleanup, post-processing, or camera updates.
   * @param dt - Delta time in seconds since the last frame
   */
  lateUpdate?(dt: number): void | Promise<void>;

  /**
   * Called when the component is being destroyed or the GameObject is being removed.
   * Use for cleanup of resources, event listeners, etc.
   */
  destroy?(): void | Promise<void>;
}
