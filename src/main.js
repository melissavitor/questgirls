import Phaser from 'phaser';
import { PALETTE } from './config/palette.js';
import MapScene from './scenes/mapscene.js';
import Minigame1Scene from './scenes/minigame1scene.js';
import Minigame2Scene from './scenes/minigame2scene.js';
import Minigame3Scene from './scenes/minigame3scene.js';
import BossScene from './scenes/bossscene.js';
import VictoryScene from './scenes/victoryscene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  pixelArt: true,
  roundPixels: true,
  backgroundColor: PALETTE.background,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.NO_CENTER
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [MapScene, Minigame1Scene, Minigame2Scene,
          Minigame3Scene, BossScene, VictoryScene]
};

new Phaser.Game(config);