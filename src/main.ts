import { Scene, Engine, FreeCamera, HemisphericLight, MeshBuilder, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
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
        let ground = MeshBuilder.CreateGround("ground", { width: 5, height: 5 }, scene);

        // Move the ground to the origin
        ground.position = new Vector3(0, 0, 0);

        const groundMaterial = new StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new Texture("public/textures/buttonbackground.png", scene);
        groundMaterial.diffuseTexture.uScale = 50.0;
        groundMaterial.diffuseTexture.vScale = 50.0;
        groundMaterial.diffuseTexture.hasAlpha = false;
        ground.material = groundMaterial;;

        return scene;
    }
}

let main = new Main();
main.start();

