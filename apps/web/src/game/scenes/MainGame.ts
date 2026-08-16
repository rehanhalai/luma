import { Scene } from "phaser";
import { EventBus } from "../EventBus";

export class MainGame extends Scene {
    constructor() {
        super('MainGame')
    }

    create() {
        this.cameras.main.setBackgroundColor(0x90ee90);

        this.add.text(450,500,"Phaser setup for luma",{
            fontSize: "24px",
        });

        EventBus.emit('current-scene-ready',this)
    }
}