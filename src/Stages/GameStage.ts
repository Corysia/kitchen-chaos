import { Engine, MeshBuilder, Scene, FreeCamera, Vector3, HemisphericLight, DirectionalLight, StandardMaterial, Texture, GroundMesh, ShadowGenerator, ImportMeshAsync, Color3 } from "@babylonjs/core";
import { Stage } from "../framework/Stage";
import { GameObject } from "../framework/GameObject";
import { VisualComponent } from "../framework/components/VisualComponent";
import { CharacterMovementComponent } from "../framework/components/CharacterMovement";
import { InputSystem } from "../framework/input/InputSystem";
import { Logger } from "../framework/logger/Logger";
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";

/**
 * Concrete implementation of Stage for the main game scene.
 * Contains the kitchen chaos game environment with player, counters, and game objects.
 */
export class GameStage extends Stage {
    /** Global input system for handling user input */
    public inputSystem!: InputSystem;

    private _shadowGenerator: ShadowGenerator | undefined;

    /**
     * Initializes the game stage with the kitchen chaos scene.
     * Sets up camera, lighting, ground, player, and kitchen counters.
     * @param engine The Babylon.js engine to use
     */
    public async initialize(engine: Engine): Promise<void> {
        registerBuiltInLoaders();
        
        this.scene = new Scene(engine);

        // initialize input system
        this.inputSystem = new InputSystem(this.scene);

        // create camera
        const camera = new FreeCamera("camera1", new Vector3(0, 10, -10), this.scene);
        camera.setTarget(Vector3.Zero());

        // create lights
        const hemlight = new HemisphericLight("light1", new Vector3(0, 1, 0), this.scene);
        hemlight.intensity = 0.7;

        const light = new DirectionalLight("dir01", new Vector3(50, -30, 0), this.scene);
        light.position = new Vector3(0, 180, -20);
        light.intensity = 0.5;

        this.createGround(50, 50, './textures/ButtonBackground.png', 50, 50);

        const shadowGenerator = new ShadowGenerator(1024, light);
        shadowGenerator.useExponentialShadowMap = true;
        this._shadowGenerator = shadowGenerator;

        // create player
        const player = this.createPlayer();
        this.addGameObject(player);

        // load kitchen counters
        await this.loadKitchenCounters();

        // call awake on all objects
        await Promise.all(this.gameObjects.map(go => go.awake()));
        
        // Mark stage as initialized
        this.initialized = true;
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
        Logger.debug("ClearCounter_Visual.glb loaded successfully");

        Logger.debug('Starting to load CuttingCounter_Visual.glb');
        const result1 = await ImportMeshAsync('./models/CuttingCounter_Visual.glb', this.scene);
        const CuttingCounter = result1.meshes[0];
        CuttingCounter.position = new Vector3(3.5, 0, 2);
        CuttingCounter.rotation = Vector3.Zero();
        CuttingCounter.receiveShadows = true;
        this._shadowGenerator?.addShadowCaster(CuttingCounter);
        Logger.debug("CuttingCounter_Visual.glb loaded successfully");

        Logger.debug('Starting to load StoveCounter_Visual.glb');
        const result2 = await ImportMeshAsync('./models/StoveCounter_Visual.glb', this.scene);
        const StoveCounter = result2.meshes[0];
        StoveCounter.position = new Vector3(5, 0, 2);
        StoveCounter.rotation = Vector3.Zero();
        StoveCounter.receiveShadows = true;
        this._shadowGenerator?.addShadowCaster(StoveCounter);
        Logger.debug("StoveCounter_Visual.glb loaded successfully");

        this.scene.getMeshByName("StoveOnVisual")?.setEnabled(true);
        Logger.debug("All actors loaded successfully");
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
                blackMaterial.specularColor = new Color3(1, 1, 1);
                blackMaterial.specularPower = 128;
                blackMaterial.ambientColor = new Color3(0.1, 0.1, 0.1);
                eyeRM.material = blackMaterial;
                Logger.debug("Eye_R material set to black");
            } else {
                Logger.warn("Eye_R mesh not found in PlayerVisual.glb");
            }
            
            Logger.debug("PlayerVisual.glb loaded successfully");
            return PlayerVisual;
        }));

        // attach movement
        player.addComponent(new CharacterMovementComponent());

        return player;
    }

    /**
     * Creates and returns a standard material with a diffuse texture for the ground.
     * @param textureUrl The URL of the diffuse texture
     * @param tileX The number of times to repeat the texture along the U axis
     * @param tileY The number of times to repeat the texture along the V axis
     * @returns The created ground material with the applied texture
     */
    private createGroundMaterial(textureUrl: string, tileX: number, tileY: number): StandardMaterial {
        const groundTexture = new Texture(textureUrl, this.scene);
        groundTexture.uScale = tileX;
        groundTexture.vScale = tileY;

        const groundMaterial = new StandardMaterial("groundMaterial", this.scene);
        groundMaterial.diffuseTexture = groundTexture;
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
}
