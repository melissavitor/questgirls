import Phaser from 'phaser';

export default class Minigame1Scene extends Phaser.Scene {
  constructor() {
    super('Minigame1Scene');
  }

  create() {
    this.add.text(400, 300, 'Minigame1Scene', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#e2e2ea'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => this.scene.start('Minigame2Scene'));
  }
}