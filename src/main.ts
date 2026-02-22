import { Scene, Engine, FreeCamera, HemisphericLight, MeshBuilder, Vector3, AbstractMesh } from "@babylonjs/core";
import "@babylonjs/inspector";

/**
 * Main class for the Kitchen Chaos Babylon.js game
 * Handles scene initialization, rendering, and user input
 */
class Main {
    private scene!: Scene;
    private engine!: Engine;
    private canvas!: HTMLCanvasElement;

    /**
     * Initializes the game by creating canvas, engine, and scene
     * Sets up event listeners and starts the render loop
     */
    public initialize(): void {
        this.canvas = document.createElement("canvas");
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        document.body.appendChild(this.canvas);
        this.engine = new Engine(this.canvas, true);
        this.createScene(this.engine, this.canvas)
            .then(scene => this.onSceneCreated(scene))
            .catch(error => console.error("Failed to initialize scene:", error));
    }

    /**
     * Called when the scene is successfully created
     * Sets up event listeners, logs scene objects, and starts rendering
     * @param scene The created Babylon.js scene
     */
    private onSceneCreated(scene: Scene): void {
        this.scene = scene;
        this.setupEventListeners();
        this.listSceneObjects();

        this.engine.runRenderLoop(() => {
            this.scene.render();
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
                if (this.scene.debugLayer.isVisible()) {
                    this.scene.debugLayer.hide();
                } else {
                    this.scene.debugLayer.show();
                }
            }
        });
    }

    /**
     * Creates and configures the Babylon.js scene with camera, lighting, and basic objects
     * @param engine The Babylon.js engine instance
     * @param canvas The HTML canvas element
     * @returns Promise that resolves to the created scene
     */
    public async createScene(engine: Engine, canvas: HTMLCanvasElement): Promise<Scene> {
        // This creates a basic Babylon Scene object (non-mesh)
        let scene = new Scene(engine);

        // This creates and positions a free camera (non-mesh)
        let camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);

        // This targets the camera to scene origin
        camera.setTarget(Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        let light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Our built-in 'sphere' shape. Params: name, options, scene
        let sphere = MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);

        // Move the sphere upward 1/2 its height
        sphere.position.y = 1;

        // Our built-in 'ground' shape. Params: name, options, scene
        MeshBuilder.CreateGround("ground", {width: 6, height: 6}, scene);

        return scene;
    }

    public listSceneObjects(): void {
        // Get the current scene
        if (!this.scene) {
            console.log("No scene available");
            return;
        }

        console.log("=== Scene Objects ===");
        
        // List all meshes
        console.log("\n--- Meshes ---");
        this.scene.meshes.forEach((mesh: AbstractMesh, index: number) => {
            console.log(`${index + 1}. ${mesh.name} (ID: ${mesh.id})`);
            console.log(`   Position: ${mesh.position.toString()}`);
            console.log(`   Visible: ${mesh.isVisible}`);
        });

        // List all lights
        console.log("\n--- Lights ---");
        this.scene.lights.forEach((light: any, index: number) => {
            console.log(`${index + 1}. ${light.name} (ID: ${light.id})`);
            console.log(`   Type: ${light.getClassName()}`);
            if (light.position) {
                console.log(`   Position: ${light.position.toString()}`);
            }
        });

        // List all cameras
        console.log("\n--- Cameras ---");
        this.scene.cameras.forEach((camera: any, index: number) => {
            console.log(`${index + 1}. ${camera.name} (ID: ${camera.id})`);
            console.log(`   Type: ${camera.getClassName()}`);
            if (camera.position) {
                console.log(`   Position: ${camera.position.toString()}`);
            }
        });

        // List all transform nodes
        console.log("\n--- Transform Nodes ---");
        this.scene.transformNodes.forEach((node: any, index: number) => {
            console.log(`${index + 1}. ${node.name} (ID: ${node.id})`);
            if (node.position) {
                console.log(`   Position: ${node.position.toString()}`);
            }
        });

        console.log("\n=== Summary ===");
        console.log(`Total Meshes: ${this.scene.meshes.length}`);
        console.log(`Total Lights: ${this.scene.lights.length}`);
        console.log(`Total Cameras: ${this.scene.cameras.length}`);
        console.log(`Total Transform Nodes: ${this.scene.transformNodes.length}`);
    }
}

const main = new Main();
main.initialize();
