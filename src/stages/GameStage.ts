import { Color4, DefaultRenderingPipeline, DirectionalLight, Engine, FreeCamera, FxaaPostProcess, GroundMesh, HemisphericLight, ImageProcessingPostProcess, ImportMeshAsync, MeshBuilder, Scene, ShadowGenerator, StandardMaterial, Texture, TonemappingOperator, Vector3 } from "@babylonjs/core";
import { Stage } from "../framework/Stage";
import { Logger } from "../framework/Logger";

export default class GameStage extends Stage {

    private _shadowGenerator: ShadowGenerator | undefined;

    protected async createScene(engine: Engine, canvas: HTMLCanvasElement): Promise<Scene> {
        // This creates a basic Babylon Scene object (non-mesh)
        super.scene = new Scene(engine);

        // This creates and positions a free camera (non-mesh)
        const camera = new FreeCamera("camera1", new Vector3(0, 10, -10), super.scene);
        // const camera = new FreeCamera("camera1", new Vector3(0, 21.5, -21.3), super.scene);

        // This targets the camera to scene origin
        camera.setTarget(Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        super.camera = camera;

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const hemlight = new HemisphericLight("light1", new Vector3(0, 1, 0), super.scene);

        // Default intensity is 1. Let's dim the light a small amount
        hemlight.intensity = 0.7;

        // light1
        const light = new DirectionalLight("dir01", new Vector3(50, -30, 0), super.scene);
        light.position = new Vector3(0, 180, -20);
        light.intensity = 0.5;

        this.createGround(50, 50, "./textures/ButtonBackground.png", 50, 50);

        this.loadActors();

        const shadowGenerator = new ShadowGenerator(1024, light);
        shadowGenerator.useExponentialShadowMap = true;

        this._shadowGenerator = shadowGenerator;

        this.applyPostProcessingEffects();
        await super.scene.whenReadyAsync();
        return super.scene;
    }

    /**
     * Applies post-processing effects to the scene.
     * 
     * @private
     * @returns {void}
     */
    private applyPostProcessingEffects(): void {
        if (!super.scene) {
            Logger.error("Scene is undefined");
            return;
        }
        if (!super.camera) {
            Logger.error("Camera is undefined");
            return;
        }
        const postProcess = new ImageProcessingPostProcess("processing", 1.0, super.camera);
        postProcess.contrast = 2.0;
        postProcess.exposure = 0.6;
        postProcess.toneMappingEnabled = true;
        postProcess.toneMappingType = TonemappingOperator.Photographic; // Use Hable tone mapping operator
        postProcess.vignetteEnabled = true; // Enable vignette effect
        postProcess.vignetteColor = new Color4(0, 0, 0, 1); // Color of the vignette effect
        postProcess.vignetteWeight = 0.4; // Weight of the vignette effect

        const fxaaPostProcess = new FxaaPostProcess("fxaa", 4.0, super.camera);
        fxaaPostProcess.apply();

        const defaultPipeline = new DefaultRenderingPipeline("ssao", true, super.scene, [super.camera]);
        defaultPipeline.bloomEnabled = true;
        defaultPipeline.bloomWeight = 1.0; // Weight of the bloom effect
        defaultPipeline.bloomThreshold = 0.95; // Threshold for bloom effect
        defaultPipeline.fxaaEnabled = true; // Enable FXAA for anti-aliasing
    }

    /**
     * Loads all the actor meshes (PlayerVisual, ClearCounter_Visual, CuttingCounter_Visual, StoveCounter_Visual) and
     * positions them. Also adds them as shadow casters to the shadow generator.
     * 
     * @returns {Promise<void>} A promise that resolves when all the actor meshes have been loaded and positioned.
     */
    private async loadActors(): Promise<void> {
        if (!super.scene) {
            Logger.error("Scene is undefined");
            return;
        }
        let result = await ImportMeshAsync("./models/PlayerVisual.glb", super.scene);
        const PlayerVisual = result.meshes[0];
        PlayerVisual.position = Vector3.Zero();;
        PlayerVisual.rotation = Vector3.Zero();;
        PlayerVisual.receiveShadows = true;
        this._shadowGenerator?.addShadowCaster(PlayerVisual)

        result = await ImportMeshAsync("./models/ClearCounter_Visual.glb", super.scene);
        const ClearCounter = result.meshes[0];
        ClearCounter.position = new Vector3(2, 0, 2);
        ClearCounter.rotation = Vector3.Zero();;
        ClearCounter.receiveShadows = true;
        this._shadowGenerator?.addShadowCaster(ClearCounter)

        result = await ImportMeshAsync("./models/CuttingCounter_Visual.glb", super.scene);
        const CuttingCounter = result.meshes[0];
        CuttingCounter.position = new Vector3(3.5, 0, 2);
        CuttingCounter.rotation = Vector3.Zero();;
        CuttingCounter.receiveShadows = true;
        this._shadowGenerator?.addShadowCaster(CuttingCounter)

        result = await ImportMeshAsync("./models/StoveCounter_Visual.glb", super.scene);
        const StoveCounter = result.meshes[0];
        StoveCounter.position = new Vector3(5, 0, 2);
        StoveCounter.rotation = Vector3.Zero();;
        StoveCounter.receiveShadows = true;
        this._shadowGenerator?.addShadowCaster(StoveCounter)

        super.scene.getMeshByName("StoveOnVisual")?.setEnabled(true);
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
        const groundTexture = new Texture(textureUrl, super.scene);
        groundTexture.uScale = tileX;
        groundTexture.vScale = tileY;

        const groundMaterial = new StandardMaterial("groundMaterial", super.scene);
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
        const ground = MeshBuilder.CreateGround("ground", { width: width, height: height }, super.scene);
        ground.position = Vector3.Zero();
        ground.material = this.createGroundMaterial(textureUrl, tileX, tileY);
        ground.receiveShadows = true;
        return ground;
    }
}