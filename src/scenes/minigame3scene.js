import Phaser from 'phaser';
import { playBackgroundMusic } from '../audio/backgroundMusic.js';
import { createVolumeControl, isVolumeControlPointer } from '../ui/volumeControl.js';

export default class Minigame3Scene extends Phaser.Scene {
  constructor() {
    super('Minigame3Scene');
  }

  create() {
    this.playBackgroundMusic();
    createVolumeControl(this);
    this.add.text(400, 300, 'Minigame3Scene', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#e2e2ea'
    }).setOrigin(0.5);

    this.input.on('pointerdown', (pointer) => {
      if (!isVolumeControlPointer(this, pointer)) this.scene.start('BossScene');
    });
  }

  playBackgroundMusic() {
    playBackgroundMusic(this, 'synthwave-1');
  }
}