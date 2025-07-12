import Lifecycle from "./Lifecycle";

export default abstract class Component implements Lifecycle {
    awake(): void {
        throw new Error("Method not implemented.");
    }
    start(): void {
        throw new Error("Method not implemented.");
    }
    update(): void {
        throw new Error("Method not implemented.");
    }
    lateUpdate(): void {
        throw new Error("Method not implemented.");
    }
}