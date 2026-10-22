import Phaser from 'phaser';
import { playBackgroundMusic } from '../audio/backgroundMusic.js';
import { createVolumeControl, isVolumeControlPointer } from '../ui/volumeControl.js';
import { PHASE_BANNERS } from '../config/phaseData.js';

const WIDTH = 800;
const HEIGHT = 600;

export default class PhaseBannerScene extends Phaser.Scene {
  constructor() {
    super('PhaseBannerScene');
  }

  create(data) {
    this.playBackgroundMusic();
    createVolumeControl(this);
    this.phase = Number(data.phase) || 1;
    this.characterId = data.personagem ?? this.registry.get('personagem') ?? 'leia';
    this.banner = PHASE_BANNERS[this.phase] ?? PHASE_BANNERS[1];

    this.cameras.main.setBackgroundColor(0x0d0b14);

    const grid = this.add.graphics().lineStyle(1, 0x3fd0e0, 0.12);
    for (let x = 0; x < WIDTH; x += 32) {
      grid.lineBetween(x, 0, x, HEIGHT);
    }
    for (let y = 0; y < HEIGHT; y += 32) {
      grid.lineBetween(0, y, WIDTH, y);
    }

    this.add.image(WIDTH / 2, HEIGHT / 2 - 30, this.banner.key)
      .setDisplaySize(576, 96);

    this.prompt = this.add.text(WIDTH / 2, HEIGHT / 2 + 105, 'CLIQUE OU PRESSIONE ENTER PARA CONTINUAR', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff',
      resolution: 2,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.prompt,
      alpha: 0.45,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.input.on('pointerdown', (pointer) => {
      if (isVolumeControlPointer(this, pointer)) return;
      this.sound.play('ui-click', { volume: 0.35 });
      this.continueToMap();
    });
    this.input.keyboard.on('keydown', this.handleKeyDown, this);
  }

  playBackgroundMusic() {
    playBackgroundMusic(this, 'synthwave-1');
  }

  handleKeyDown(event) {
    if (!event.repeat && (event.key === 'Enter' || event.key === ' ')) {
      this.continueToMap();
    }
  }

  continueToMap() {
    this.scene.start('MapScene', {
      mapId: this.banner.mapId,
      personagem: this.characterId,
    });
  }
}
