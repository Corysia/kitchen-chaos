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

    public async start(): Promise<void> {
        Logger.debug("Main::start()");
        StageManager.addStage("GameStage", new GameStage)
        await StageManager.setActiveStage("GameStage");
        StageManager.startRenderLoop();
    }

    private addEventListeners() {
        window.addEventListener("keydown", (ev) => {
            switch (ev.code) {
                case "KeyF":
                    if (ev.shiftKey && ev.ctrlKey && ev.altKey) {
                        StageManager.engine.switchFullscreen(false);
                    }
                    break;
                case "KeyI":
                    if (ev.shiftKey && ev.ctrlKey && ev.altKey) {
                        if (StageManager.scene.debugLayer.isVisible()) {
                            StageManager.scene.debugLayer.hide();
                        } else {
                            StageManager.scene.debugLayer.show();
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
await main.start();