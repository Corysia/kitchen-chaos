import { Scene, Engine, FreeCamera, GroundMesh, HemisphericLight, MeshBuilder, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import "@babylonjs/inspector";

class Main {

    static engine: Engine;
    static scene: Scene;
    constructor() {
        let canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "renderCanvas";
        document.body.appendChild(canvas);
        Main.engine = new Engine(canvas, true);
        Main.scene = this.createScene(Main.engine, canvas);

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
        let scene = new Scene(engine);

        // This creates and positions a free camera (non-mesh)
        let camera = new FreeCamera("camera1", new Vector3(0, 3, -3), scene);

        // This targets the camera to scene origin
        camera.setTarget(Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        let light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Our built-in 'ground' shape. Params: name, options, scene
        this.createGround();

        return scene;
    }

    /**
     * Creates and returns a StandardMaterial for the ground with a diffuse texture.
     * The texture is scaled to repeat 50 times along both the U and V axes.
     *
     * @returns {StandardMaterial} The configured ground material.
     */

    private createGroundMaterial(): StandardMaterial {
        const groundMaterial = new StandardMaterial("groundMaterial", Main.scene);
        groundMaterial.diffuseTexture = new Texture("./textures/ButtonBackground.png", Main.scene);
        (groundMaterial.diffuseTexture as Texture).uScale = 50;
        (groundMaterial.diffuseTexture as Texture).vScale = 50;
        return groundMaterial;
    }

    /**
     * Creates and returns a GroundMesh for the scene, with the
     * StandardMaterial returned by createGroundMaterial.
     *
     * @returns {GroundMesh} The created and configured ground mesh.
     */
    private createGround(): GroundMesh {
        let ground = MeshBuilder.CreateGround("ground", { width: 5, height: 5 }, Main.scene);
        ground.material = this.createGroundMaterial();
        return ground;
    }
}

let main = new Main();
main.start();

