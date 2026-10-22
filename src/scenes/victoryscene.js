import Phaser from 'phaser';
import { playBackgroundMusic } from '../audio/backgroundMusic.js';
import { createVolumeControl } from '../ui/volumeControl.js';

export default class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create(data) {
    this.playBackgroundMusic();
    createVolumeControl(this);
    const characterId = data.personagem ?? this.registry.get('personagem') ?? 'leia';
    const guardian = characterId === 'leia' ? 'Guardiã' : 'Guardião';
    this.cameras.main.setBackgroundColor(0x0d0b14);

    const grid = this.add.graphics().lineStyle(1, 0x3fd0e0, 0.16);
    for (let x = 0; x < 800; x += 32) grid.lineBetween(x, 0, x, 600);
    for (let y = 0; y < 600; y += 32) grid.lineBetween(0, y, 800, y);

    this.add.image(400, 86, 'victory-banner').setDisplaySize(384, 120);
    this.add.text(400, 176, 'TROJAN DESINTEGRADO EM CÓDIGO BINÁRIO', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#f5d56b',
      resolution: 2,
    }).setOrigin(0.5);

    this.add.nineslice(400, 310, 'intro-dialog-box', undefined, 720, 190, 5, 5, 5, 5);
    this.add.text(72, 244,
      'HERA — CONSEGUIMOS! A ameaça foi totalmente neutralizada e o núcleo da Rede Kyber está seguro.',
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '11px',
        color: '#ffffff',
        wordWrap: { width: 650 },
        lineSpacing: 7,
        resolution: 2,
      });
    this.add.text(72, 326,
      `Você provou ser uma verdadeira ${guardian}: alguém que domina a tecnologia e sabe como usá-la para proteger as pessoas e seus dados. Parabéns pela vitória!`,
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#b6a9cf',
        wordWrap: { width: 650 },
        lineSpacing: 7,
        resolution: 2,
      });

    this.menuButton = this.add.nineslice(
      400,
      520,
      'boss-battle-box',
      undefined,
      260,
      48,
      8,
      8,
      8,
      8,
    ).setInteractive({ useHandCursor: true });
    this.menuLabel = this.add.text(400, 520, 'VOLTAR AO MENU', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffffff',
      resolution: 2,
    }).setOrigin(0.5);
    this.menuButton.on('pointerover', () => {
      this.menuButton.setTint(0x8fdce8);
      this.menuLabel.setColor('#3fd0e0');
    });
    this.menuButton.on('pointerout', () => {
      this.menuButton.clearTint();
      this.menuLabel.setColor('#ffffff');
    });
    this.menuButton.on('pointerdown', () => {
      this.sound.play('ui-click', { volume: 0.35 });
      this.returnToMenu();
    });
    this.input.keyboard.on('keydown', this.handleKeyDown, this);
  }

  playBackgroundMusic() {
    playBackgroundMusic(this, 'afterburner-1');
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