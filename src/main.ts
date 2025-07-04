import "@babylonjs/inspector";
import { Logger, LogLevel, LogTimestampFormat } from "./framework/Logger";
import GameStage from "./GameStage";
import { StageManager } from "./framework/StageManager";

class Main {

    constructor() {
        Logger.logLevel = LogLevel.TRACE;
        Logger.timestampFormat = LogTimestampFormat.LOCAL;
        Logger.debug("Main::constructor()");
        this.addEventListeners();
    }

    public start(): void {
        Logger.debug("Main::start()");
        let gameStage = new GameStage();
        gameStage.load();
        StageManager.addStage("GameStage", gameStage)
        StageManager.setActiveStage("GameStage");
        StageManager.startRenderLoop();
    }

    private addEventListeners() {
        let manager = StageManager.instance;
        let engine = manager.engine;
        let scene = manager.scene;

        window.addEventListener("keydown", (ev) => {
            switch (ev.code) {
                case "KeyF":
                    if (ev.shiftKey && ev.ctrlKey && ev.altKey) {
                        engine.switchFullscreen(false);
                    }
                    break;
                case "KeyI":
                    if (ev.shiftKey && ev.ctrlKey && ev.altKey) {
                        if (scene.debugLayer.isVisible()) {
                            scene.debugLayer.hide();
                        } else {
                            scene.debugLayer.show();
                        }
                    }
                    break;
                default:
                    break;
            }
        });

        Logger.info("Application initialized.");
        Logger.warn("this is a warning");
        Logger.error("this is an error");
    }
}

const main = new Main();
main.start();