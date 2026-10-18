import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.add.text(400, 300, 'MenuScene', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#e2e2ea'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => this.scene.start('Minigame1Scene'));
  }
}