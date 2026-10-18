import Phaser from 'phaser';

export default class Minigame2Scene extends Phaser.Scene {
  constructor() {
    super('Minigame2Scene');
  }

  create() {
    this.add.text(400, 300, 'BootScene', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#e2e2ea'
    }).setOrigin(0.5);
  }
}