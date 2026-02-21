/**
 * Defines the lifecycle methods for components in the game engine.
 * 
 * ## Guaranteed Execution Order
 * All implementations of this interface will follow this strict execution order:
 * 
 * 1. **awake()** - Called once when the component is created
 * 2. **start()** - Called once before the first frame update
 * 3. **earlyUpdate()** - Called every frame before update()
 * 4. **update()** - Called every frame for main logic
 * 5. **lateUpdate()** - Called every frame after update()
 * 6. **destroy()** - Called once when the component is destroyed
 * 
 * ## Notes
 * - awake() and start() are called only once per component instance
 * - earlyUpdate(), update(), and lateUpdate() are called every frame during gameplay
 * - destroy() is called when the component is being cleaned up
 * - All methods support both synchronous and asynchronous (Promise) execution
 */
export default interface Lifecycle {
    /**
     * Called when the component is created
     */
    awake(): void | Promise<void>;
    /**
     * Called when the component is started
     */
    start(): void | Promise<void>;
    /**
     * Called every frame before update
     */
    earlyUpdate(): void | Promise<void>;
    /**
     * Called every frame
     */
    update(): void | Promise<void>;
    /**
     * Called every frame after update
     */
    lateUpdate(): void | Promise<void>;
    /**
     * Called when the component is destroyed
     */
    destroy(): void | Promise<void>;
}