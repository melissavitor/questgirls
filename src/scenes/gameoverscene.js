import Phaser from 'phaser';
import { CREDITS } from '../config/menuData.js';

const WIDTH = 800;
const HEIGHT = 600;

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x0d0b14);

    const grid = this.add.graphics().lineStyle(1, 0x3b1f50, 0.3);
    for (let x = 16; x < WIDTH; x += 32) {
      grid.lineBetween(x, 0, x, HEIGHT);
    }
    for (let y = 16; y < HEIGHT; y += 32) {
      grid.lineBetween(0, y, WIDTH, y);
    }

    this.credits = this.add.container(0, 0);
    this.credits.add(this.add.text(WIDTH / 2, 76, 'FIM DE JOGO', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: '#ff3fa4',
      resolution: 2,
    }).setOrigin(0.5));
    this.credits.add(this.add.text(WIDTH / 2, 116, 'TODAS AS VIDAS FORAM PERDIDAS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffffff',
      resolution: 2,
    }).setOrigin(0.5));

    this.creditsText = this.add.text(
      WIDTH / 2,
      HEIGHT + 24,
      ['CRÉDITOS', ...CREDITS].join('\n\n'),
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#b6a9cf',
        align: 'center',
        lineSpacing: 8,
        resolution: 2,
      },
    ).setOrigin(0.5, 0);
    this.credits.add(this.creditsText);

    this.tweens.add({
      targets: this.credits,
      y: -(HEIGHT + this.creditsText.height + 24),
      duration: 22000,
      repeat: -1,
      onRepeat: () => this.credits.setY(0),
    });

    this.menuButton = this.add.rectangle(WIDTH / 2, 540, 250, 48, 0x100c1a, 1)
      .setStrokeStyle(2, 0x3fd0e0)
      .setInteractive({ useHandCursor: true });
    this.menuButtonLabel = this.add.text(WIDTH / 2, 540, 'VOLTAR AO MENU', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffffff',
      resolution: 2,
    }).setOrigin(0.5);

    this.menuButton.on('pointerover', () => {
      this.menuButton.setFillStyle(0x2a2037);
      this.menuButtonLabel.setColor('#3fd0e0');
    });
    this.menuButton.on('pointerout', () => {
      this.menuButton.setFillStyle(0x100c1a);
      this.menuButtonLabel.setColor('#ffffff');
    });
    this.menuButton.on('pointerdown', this.returnToMenu, this);
    this.input.keyboard.on('keydown', this.handleKeyDown, this);
  }

  handleKeyDown(event) {
    if (!event.repeat && ['Enter', ' '].includes(event.key)) {
      this.returnToMenu();
    }
  }

  returnToMenu() {
    this.scene.start('MenuScene');
  }
}
