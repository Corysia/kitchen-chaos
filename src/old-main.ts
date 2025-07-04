import { Scene, Engine, FreeCamera, GroundMesh, HemisphericLight, MeshBuilder, StandardMaterial, Texture, Vector3, ImportMeshAsync, TonemapPostProcess, TonemappingOperator, ShadowGenerator, DirectionalLight, ImageProcessingPostProcess, DefaultRenderingPipeline } from "@babylonjs/core";
import "@babylonjs/inspector";

class Main {

    static engine: Engine;
    static scene: Scene;
    static camera: FreeCamera
    static shadowGenerator: ShadowGenerator

    /**
     * Constructor for the Main class.
     *
     * Creates a new Engine and Scene, and appends a canvas to the body.
     * Also sets up event listeners for resizing the window and toggling fullscreen and the debug layer.
     */
    constructor() {
        let canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "renderCanvas";
        document.body.appendChild(canvas);
        Main.engine = new Engine(canvas, true);
        Main.scene = this.createScene(Main.engine, canvas);

        this.createShadows();
        this.applyPostProcessingEffects();


        window.addEventListener("resize", function () {
            Main.engine.resize();
        });

        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+F
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.code === "KeyF") {
                Main.engine.switchFullscreen(false);
            }

            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.code === "KeyI") {
                if (Main.scene.debugLayer.isVisible()) {
                    Main.scene.debugLayer.hide();
                } else {
                    Main.scene.debugLayer.show();
                }
            }
        });

    }

    public start(): void {
        Main.engine.runRenderLoop(function () {
            Main.scene.render();
        })
    }

    public createScene(engine: Engine, canvas: HTMLCanvasElement): Scene {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new Scene(engine);

        // This creates and positions a free camera (non-mesh)
        Main.camera = new FreeCamera("camera1", new Vector3(0, 10, -10), scene);

        // This targets the camera to scene origin
        Main.camera.setTarget(Vector3.Zero());

        // This attaches the camera to the canvas
        Main.camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const hemlight = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount
        hemlight.intensity = 0.7;

        // light1
        const light = new DirectionalLight("dir01", new Vector3(1, -2, 2), scene);
        light.position = new Vector3(20, 40, 20);
        light.intensity = 0.5;


        this.createGround(50, 50, "./textures/ButtonBackground.png", 50, 50);

        this.loadActors();

        Main.shadowGenerator = new ShadowGenerator(1024, light);
        Main.shadowGenerator.useExponentialShadowMap = true;

        return scene;
    }

    private createShadows(): void {
        // Shadows

    }

    private applyPostProcessingEffects(): void {
        let postProcess = new TonemapPostProcess("tonemap", TonemappingOperator.Photographic, 1.8, Main.camera);
        postProcess.exposureAdjustment = 2.0;
        let postProcess2 = new ImageProcessingPostProcess("processing", 1.0, Main.camera);
        postProcess2.contrast = 2.0;
        postProcess2.exposure = 0.5;

        let defaultPipeline = new DefaultRenderingPipeline("default", false, Main.scene, [Main.camera]);
        defaultPipeline.bloomEnabled = false;
        defaultPipeline.bloomWeight = 0.1;
    }

    private async loadActors(): Promise<void> {
        let result = await ImportMeshAsync("./models/PlayerVisual.glb", Main.scene);
        const PlayerVisual = result.meshes[0];
        PlayerVisual.position = new Vector3(0, 0, 0);
        PlayerVisual.rotation = new Vector3(0, 0, 0);
        PlayerVisual.receiveShadows = true;
        Main.shadowGenerator.addShadowCaster(PlayerVisual)

        result = await ImportMeshAsync("./models/ClearCounter_Visual.glb", Main.scene);
        const ClearCounter = result.meshes[0];
        ClearCounter.position = new Vector3(2, 0, 2);
        ClearCounter.rotation = new Vector3(0, 0, 0);
        ClearCounter.receiveShadows = true;
        Main.shadowGenerator.addShadowCaster(ClearCounter)

        result = await ImportMeshAsync("./models/CuttingCounter_Visual.glb", Main.scene);
        const CuttingCounter = result.meshes[0];
        CuttingCounter.position = new Vector3(3.5, 0, 2);
        CuttingCounter.rotation = new Vector3(0, 0, 0);
        CuttingCounter.receiveShadows = true;
        Main.shadowGenerator.addShadowCaster(CuttingCounter)

        result = await ImportMeshAsync("./models/StoveCounter_Visual.glb", Main.scene);
        const StoveCounter = result.meshes[0];
        StoveCounter.position = new Vector3(5, 0, 2);
        StoveCounter.rotation = new Vector3(0, 0, 0);
        StoveCounter.receiveShadows = true;
        Main.shadowGenerator.addShadowCaster(StoveCounter)

        Main.scene.getMeshByName("StoveOnVisual")?.setEnabled(true);
    }


    /**
     * Creates and returns a standard material with a diffuse texture for the ground.
     * The texture is scaled to repeat tileX times along the U axis and tileY times along the V axis.
     *
     * @param {string} textureUrl The URL of the diffuse texture.
     * @param {number} tileX The number of times to repeat the texture along the U axis.
     * @param {number} tileY The number of times to repeat the texture along the V axis.
     *
     * @returns {StandardMaterial} The created ground material with the applied texture.
     */
    private createGroundMaterial(textureUrl: string, tileX: number, tileY: number): StandardMaterial {
        const groundTexture = new Texture(textureUrl, Main.scene);
        groundTexture.uScale = tileX;
        groundTexture.vScale = tileY;

        const groundMaterial = new StandardMaterial("groundMaterial", Main.scene);
        groundMaterial.diffuseTexture = groundTexture;
        return groundMaterial;
    }

    /**
     * Creates and returns a ground mesh with a standard material that has a diffuse texture.
     * The ground mesh is created with MeshBuilder.CreateGround() and the texture is scaled to repeat tileX times along the U axis and tileY times along the V axis.
     *
     * @param {number} width The width of the ground mesh.
     * @param {number} height The height of the ground mesh.
     * @param {string} textureUrl The URL of the diffuse texture.
     * @param {number} tileX The number of times to repeat the texture along the U axis.
     * @param {number} tileY The number of times to repeat the texture along the V axis.
     *
     * @returns {GroundMesh} The created ground mesh.
     */
    private createGround(width: number, height: number, textureUrl: string, tileX: number, tileY: number): GroundMesh {
        const ground = MeshBuilder.CreateGround("ground", { width: width, height: height }, Main.scene);
        ground.position = new Vector3(0, 0, 0);
        ground.material = this.createGroundMaterial(textureUrl, tileX, tileY);
        ground.receiveShadows = true;
        return ground;
    }
}

let main = new Main();
main.start();

