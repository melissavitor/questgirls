import Phaser from 'phaser';

export default class BossScene extends Phaser.Scene {
  constructor() {
    super('BossScene');
  }

  create() {
    this.add.text(400, 300, 'BossScene', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#e2e2ea'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => this.scene.start('VictoryScene'));
  }
}