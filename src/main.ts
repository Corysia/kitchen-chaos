import { Engine, AbstractMesh, Scene } from "@babylonjs/core";
import "@babylonjs/inspector";
import { SceneManager } from "./framework/SceneManager";

/**
 * Main class for the Kitchen Chaos Babylon.js game
 * Handles canvas creation, engine initialization, and SceneManager setup
 */
class Main {
    private engine!: Engine;
    private canvas!: HTMLCanvasElement;
    private sceneManager!: SceneManager;

    /**
     * Initializes game by creating canvas, engine, and SceneManager
     * Sets up event listeners and starts render loop
     */
    public initialize(): void {
        this.canvas = document.createElement("canvas");
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        document.body.appendChild(this.canvas);
        this.engine = new Engine(this.canvas, true);
        
        // Initialize SceneManager
        this.sceneManager = new SceneManager(this.engine);
        const scene = this.sceneManager.createScene();
        
        this.onSceneCreated(scene);
    }

    /**
     * Called when scene is successfully created
     * Sets up event listeners, logs scene objects, and starts rendering
     * @param scene The created Babylon.js scene
     */
    private onSceneCreated(scene: Scene): void {
        this.setupEventListeners();
        this.listSceneObjects();

        this.engine.runRenderLoop(() => {
            scene.render();
        });
    }

    /**
     * Sets up global event listeners for window resize and keyboard shortcuts
     * Handles fullscreen toggle and debug layer visibility
     */
    private setupEventListeners(): void {
        globalThis.addEventListener("resize", () => {
            this.engine.resize();
        });

        globalThis.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+F
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.code === "KeyF") {
                this.engine.switchFullscreen(false);
            }
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.code === "KeyI") {
                if (this.sceneManager.scene.debugLayer.isVisible()) {
                    this.sceneManager.scene.debugLayer.hide();
                } else {
                    this.sceneManager.scene.debugLayer.show();
                }
            }
        });
    }

    public listSceneObjects(): void {
        // Get the current scene from SceneManager
        if (!this.sceneManager.scene) {
            console.log("No scene available");
            return;
        }

        console.log("=== Scene Objects ===");
        
        // List all meshes
        console.log("\n--- Meshes ---");
        this.sceneManager.scene.meshes.forEach((mesh: AbstractMesh, index: number) => {
            console.log(`${index + 1}. ${mesh.name} (ID: ${mesh.id})`);
            console.log(`   Position: ${mesh.position.toString()}`);
            console.log(`   Visible: ${mesh.isVisible}`);
        });

        // List all lights
        console.log("\n--- Lights ---");
        this.sceneManager.scene.lights.forEach((light: any, index: number) => {
            console.log(`${index + 1}. ${light.name} (ID: ${light.id})`);
            console.log(`   Type: ${light.getClassName()}`);
            if (light.position) {
                console.log(`   Position: ${light.position.toString()}`);
            }
        });

        // List all cameras
        console.log("\n--- Cameras ---");
        this.sceneManager.scene.cameras.forEach((camera: any, index: number) => {
            console.log(`${index + 1}. ${camera.name} (ID: ${camera.id})`);
            console.log(`   Type: ${camera.getClassName()}`);
            if (camera.position) {
                console.log(`   Position: ${camera.position.toString()}`);
            }
        });

        // List all transform nodes
        console.log("\n--- Transform Nodes ---");
        this.sceneManager.scene.transformNodes.forEach((node: any, index: number) => {
            console.log(`${index + 1}. ${node.name} (ID: ${node.id})`);
            if (node.position) {
                console.log(`   Position: ${node.position.toString()}`);
            }
        });

        console.log("\n=== Summary ===");
        console.log(`Total Meshes: ${this.sceneManager.scene.meshes.length}`);
        console.log(`Total Lights: ${this.sceneManager.scene.lights.length}`);
        console.log(`Total Cameras: ${this.sceneManager.scene.cameras.length}`);
        console.log(`Total Transform Nodes: ${this.sceneManager.scene.transformNodes.length}`);
    }
}

const main = new Main();
main.initialize();
