import { AUTO,Game } from "phaser";
import { MainGame } from "./scenes/MainGame";

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#028c78',
  scene: [MainGame],
};


const StartGame = (parent :string) => {
    return new Game({...config,parent})
}
export default StartGame;