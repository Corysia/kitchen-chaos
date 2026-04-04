import { MeshBuilder, Scene, FreeCamera, Vector3, HemisphericLight, DirectionalLight, StandardMaterial, PBRMaterial, Texture, GroundMesh, ShadowGenerator, ImportMeshAsync, Color3, Color4, DefaultRenderingPipeline, TonemappingOperator, ColorCurves } from "@babylonjs/core";
import { Stage } from "../framework/Stage";
import { StageManager } from "../framework/StageManager";
import { GameObject } from "../framework/GameObject";
import { VisualComponent } from "../framework/components/VisualComponent";
import { CharacterMovementComponent } from "../framework/components/CharacterMovement";
import { InputSystem } from "../framework/input/InputSystem";
import { Logger } from "../framework/logger/Logger";
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";

/**
 * GameStage class that manages the main game scene
 * Extends Stage to provide game-specific functionality
 */
export class GameStage extends Stage {
    public camera!: FreeCamera;
    public inputSystem!: InputSystem;
    private _shadowGenerator: ShadowGenerator | undefined;

    /**
     * Called when the stage is created. Sets up the scene, camera, lighting, and input system.
     * This is where one-time setup that doesn't depend on other components should happen.
     */
    public async awake(): Promise<void> {
        await super.awake();
        
        registerBuiltInLoaders();
        
        // Create scene with HDR configuration
        this.scene = new Scene(StageManager.instance.engine);
        this.scene.clearColor = new Color4(0.02, 0.02, 0.02, 1); // Dark HDR clear color
        this.scene.imageProcessingConfiguration.toneMappingEnabled = true;
        this.scene.imageProcessingConfiguration.toneMappingType = TonemappingOperator.Reinhard; // Use Reinhard as fallback
        this.scene.imageProcessingConfiguration.exposure = 1;

        // Input system will be initialized when needed
        this.inputSystem = new InputSystem(this.scene);

        // Create camera with HDR configuration
        this.camera = new FreeCamera("camera1", new Vector3(0, 10, -10), this.scene);
        this.camera.setTarget(Vector3.Zero());
        this.camera.minZ = 0.1;
        this.camera.maxZ = 1000;
        this.camera.fov = 0.8; // Slightly wider FOV for better HDR composition

        // Create lights
        const hemlight = new HemisphericLight("light1", new Vector3(0, 1, 0), this.scene);
        hemlight.intensity = 0.7;

        const light = new DirectionalLight("dir01", new Vector3(50, -30, 0), this.scene);
        light.position = new Vector3(0, 180, -20);
        light.intensity = 0.5;

        this.createGround(50, 50, './textures/ButtonBackground.png', 50, 50);

        const shadowGenerator = new ShadowGenerator(1024, light);
        shadowGenerator.useExponentialShadowMap = true;
        this._shadowGenerator = shadowGenerator;
    }

    /**
     * Called before the first frame. Loads assets and finalizes setup.
     * This is where initialization that may depend on other components should happen.
     */
    public async start(): Promise<void> {
        await super.start();
        
        // Load kitchen counters
        await this.loadKitchenCounters();

        // Load some items
        await this.loadItems();
        
        // Create player
        const player = this.createPlayer();
        this.addGameObject(player);

        this.applyPostProcessingEffects();
    }

    /**
     * Loads all kitchen counter models into the scene.
     */
    private async loadKitchenCounters(): Promise<void> {
        Logger.debug('Starting to load ClearCounter_Visual.glb');
        const result = await ImportMeshAsync('./models/ClearCounter_Visual.glb', this.scene);
        const ClearCounter = result.meshes[0];
        ClearCounter.position = new Vector3(2, 0, 2);
        ClearCounter.rotation = Vector3.Zero();
        ClearCounter.receiveShadows = true;
        this._shadowGenerator?.addShadowCaster(ClearCounter);
        this.adjustMeshMaterials(result.meshes);
        Logger.debug("ClearCounter_Visual.glb loaded successfully");

        Logger.debug('Starting to load CuttingCounter_Visual.glb');
        const result1 = await ImportMeshAsync('./models/CuttingCounter_Visual.glb', this.scene);
        const CuttingCounter = result1.meshes[0];
        CuttingCounter.position = new Vector3(3.5, 0, 2);
        CuttingCounter.rotation = Vector3.Zero();
        CuttingCounter.receiveShadows = true;
        this._shadowGenerator?.addShadowCaster(CuttingCounter);
        this.adjustMeshMaterials(result1.meshes);
        Logger.debug("CuttingCounter_Visual.glb loaded successfully");

        Logger.debug('Starting to load StoveCounter_Visual.glb');
        const result2 = await ImportMeshAsync('./models/StoveCounter_Visual.glb', this.scene);
        const StoveCounter = result2.meshes[0];
        StoveCounter.position = new Vector3(5, 0, 2);
        StoveCounter.rotation = Vector3.Zero();
        StoveCounter.receiveShadows = true;
        this._shadowGenerator?.addShadowCaster(StoveCounter);
        this.adjustMeshMaterials(result2.meshes);
        Logger.debug("StoveCounter_Visual.glb loaded successfully");

        this.scene.getMeshByName("StoveOnVisual")?.setEnabled(true);
        Logger.debug("All counters loaded successfully");
    }

    /**
     * Adjusts material properties to reduce shine on loaded meshes
     * @param meshes Array of meshes to process
     * @param metallic Value for PBR metallic property (0-1)
     * @param roughness Value for PBR roughness property (0-1)
     * @param specularColor RGB values for StandardMaterial specular color
     * @param specularPower Value for StandardMaterial specular power
     */
    private adjustMeshMaterials(
        meshes: any[], 
        metallic: number = 0.2, 
        roughness: number = 0.4, 
        specularColor: Color3 = new Color3(0.5, 0.5, 0.5), 
        specularPower: number = 64
    ): void {
        meshes.forEach(mesh => {
            if (mesh.material) {
                Logger.debug(`Mesh: ${mesh.name}, Material type: ${mesh.material.constructor.name}`);
                
                // Check if it's a PBR material
                if (mesh.material instanceof PBRMaterial) {
                    Logger.debug('Found PBR material - adjusting metallic/roughness properties');
                    // PBR materials use different properties
                    const pbrMaterial = mesh.material;
                    Logger.debug(`Current metallic: ${pbrMaterial.metallic}, roughness: ${pbrMaterial.roughness}`);
                    pbrMaterial.metallic = metallic;
                    pbrMaterial.roughness = roughness;
                } else if (mesh.material instanceof StandardMaterial) {
                    Logger.debug('Found StandardMaterial - adjusting specular properties');
                    const material = mesh.material as StandardMaterial;
                    Logger.debug(`Current specularColor: ${material.specularColor}, specularPower: ${material.specularPower}`);
                    material.specularColor = specularColor;
                    material.specularPower = specularPower;
                }
            }
        });
    }

    /**
     * Loads some items
     */
    private async loadItems(): Promise<void> {
        Logger.debug('Starting to load Tomato_Visual.glb');
        const result = await ImportMeshAsync('./models/Tomato_Visual.glb', this.scene);
        const Tomato = result.meshes[0];
        Tomato.position = new Vector3(2, 0, 0);
        Tomato.rotation = Vector3.Zero();
        Tomato.receiveShadows = true;
        this._shadowGenerator?.addShadowCaster(Tomato);
        this.adjustMeshMaterials(result.meshes);
        Logger.debug("Tomato_Visual.glb loaded successfully");

        Logger.debug('Starting to load Cabbage_Visual.glb');
        const result1 = await ImportMeshAsync('./models/Cabbage_Visual.glb', this.scene);
        const Cabbage = result1.meshes[0];
        Cabbage.position = new Vector3(3.5, 0, 0);
        Cabbage.rotation = Vector3.Zero();
        Cabbage.receiveShadows = true;
        this._shadowGenerator?.addShadowCaster(Cabbage);
        this.adjustMeshMaterials(result1.meshes);
        Logger.debug("Cabbage_Visual.glb loaded successfully");
    }

    /**
     * Creates and configures the player GameObject.
     * @returns The configured player GameObject
     */
    private createPlayer(): GameObject {
        const player = new GameObject("Player", this.scene);

        // attach visual
        player.addComponent(new VisualComponent(async (scene) => {
            Logger.debug('Starting to load PlayerVisual.glb');
            let result = await ImportMeshAsync('./models/PlayerVisual.glb', scene);
            const PlayerVisual = result.meshes[0];
            PlayerVisual.position = Vector3.Zero();
            PlayerVisual.rotation = Vector3.Zero();
            PlayerVisual.receiveShadows = true;
            this._shadowGenerator?.addShadowCaster(PlayerVisual);
            
            // Find Eye_R mesh and set its material to black
            const eyeRM = scene.getMeshByName("Eye_R");
            if (eyeRM) {
                const blackMaterial = new StandardMaterial("EyeR_Black_Material", scene);
                blackMaterial.diffuseColor = new Color3(0, 0, 0);
                eyeRM.material = blackMaterial;
                Logger.debug("Eye_R material set to black");
            } else {
                Logger.warn("Eye_R mesh not found in PlayerVisual.glb");
            }

            // Adjust materials on all loaded meshes
            this.adjustMeshMaterials(result.meshes);
            
            Logger.debug("PlayerVisual.glb loaded successfully");
            return PlayerVisual;
        }));

        // attach movement
        player.addComponent(new CharacterMovementComponent());

        return player;
    }

    /**
     * Creates and returns a standard material with a diffuse texture and optional bump map for the ground.
     * @param textureUrl The URL of the diffuse texture
     * @param tileX The number of times to repeat the texture along the U axis
     * @param tileY The number of times to repeat the texture along the V axis
     * @param bumpTextureUrl Optional URL of the bump/normal map texture
     * @returns The created ground material with applied texture(s)
     */
    private createGroundMaterial(textureUrl: string, tileX: number, tileY: number, bumpTextureUrl?: string): StandardMaterial {
        const groundTexture = new Texture(textureUrl, this.scene);
        groundTexture.uScale = tileX;
        groundTexture.vScale = tileY;

        const groundMaterial = new StandardMaterial("groundMaterial", this.scene);
        groundMaterial.diffuseTexture = groundTexture;
        
        // Add bump mapping if texture URL is provided
        if (bumpTextureUrl) {
            const bumpTexture = new Texture(bumpTextureUrl, this.scene);
            bumpTexture.uScale = tileX;
            bumpTexture.vScale = tileY;
            groundMaterial.bumpTexture = bumpTexture;
        }
        
        return groundMaterial;
    }

    /**
     * Creates and returns a ground mesh with a standard material that has a diffuse texture.
     * @param width The width of the ground mesh
     * @param height The height of the ground mesh
     * @param textureUrl The URL of the diffuse texture
     * @param tileX The number of times to repeat the texture along the U axis
     * @param tileY The number of times to repeat the texture along the V axis
     * @returns The created ground mesh
     */
    private createGround(width: number, height: number, textureUrl: string, tileX: number, tileY: number): GroundMesh {
        const ground = MeshBuilder.CreateGround("ground", { width: width, height: height }, this.scene);
        ground.position = Vector3.Zero();
        ground.material = this.createGroundMaterial(textureUrl, tileX, tileY);
        ground.receiveShadows = true;
        return ground;
    }

    /**
     * Applies HDR post-processing effects including bloom, tone mapping, and anti-aliasing
     */
    private applyPostProcessingEffects(): void {
        if (!this.scene) {
            Logger.error("Scene is undefined");
            return;
        }
        if (!this.camera) {
            Logger.error("Camera is undefined");
            return;
        }

        // Create default rendering pipeline with HDR features
        const defaultPipeline = new DefaultRenderingPipeline("default", true, this.scene, [this.camera]);
        
        // Anti-aliasing
        defaultPipeline.samples = 4; // MSAA for better quality
        defaultPipeline.fxaaEnabled = true;
        
        // Bloom configuration
        defaultPipeline.bloomEnabled = true;
        defaultPipeline.bloomKernel = 64; // Higher quality bloom
        defaultPipeline.bloomWeight = 0.95; // More subtle bloom
        defaultPipeline.bloomThreshold = 1; // Only bloom bright areas
        
        // Image processing (built into pipeline)
        defaultPipeline.imageProcessing.contrast = 1.1;
        defaultPipeline.imageProcessing.exposure = 1;
        defaultPipeline.imageProcessing.toneMappingEnabled = true;
        defaultPipeline.imageProcessing.toneMappingType = TonemappingOperator.Reinhard;
        
        // Vignette effect
        defaultPipeline.imageProcessing.vignetteEnabled = true;
        defaultPipeline.imageProcessing.vignetteWeight = 0.3;
        defaultPipeline.imageProcessing.vignetteColor = new Color4(0, 0, 0, 1);
        
        // Color curves for saturation
        defaultPipeline.imageProcessing.colorCurves = new ColorCurves();
        if (defaultPipeline.imageProcessing.colorCurves) {
            defaultPipeline.imageProcessing.colorCurves.globalSaturation = 1.1;
        }
    }
}
