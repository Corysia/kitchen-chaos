export interface Lifecycle {
    awake(): void;
    start(): void;
    update(): void;
    lateUpdate(): void;
}