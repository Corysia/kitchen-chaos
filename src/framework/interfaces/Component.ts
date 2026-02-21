import Lifecycle from "./Lifecycle";

export default abstract class Component implements Lifecycle {
    /**
     * Called when the component is created
     */
    awake(): void {
        throw new Error("Method not implemented.");
    }
    /**
     * Called when the component is started
     */
    start(): void {
        throw new Error("Method not implemented.");
    }
    /**
     * Called every frame before update
     */
    earlyUpdate(): void {
        throw new Error("Method not implemented.");
    }
    /**
     * Called every frame
     */
    update(): void {
        throw new Error("Method not implemented.");
    }
    /**
     * Called every frame after update
     */
    lateUpdate(): void {
        throw new Error("Method not implemented.");
    }
    /**
     * Called when the component is destroyed
     */
    destroy(): void {
        // Override in subclasses to clean up component resources
        throw new Error("Method not implemented.");
    }
}