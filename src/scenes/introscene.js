import Phaser from 'phaser';
import { CHARACTERS, START_SCENE } from '../config/menuData.js';

const WIDTH = 800;
const HEIGHT = 600;
const COLORS = {
  background: 0x0d0b14,
  text: '#ffffff',
  muted: '#b6a9cf',
};

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
  }

  create(data) {
    this.characterId = data.personagem ?? this.registry.get('personagem') ?? 'leia';
    this.nextScene = data.nextScene ?? START_SCENE;
    this.character = CHARACTERS.find(({ id }) => id === this.characterId) ?? CHARACTERS[0];
    this.pageIndex = 0;
    this.isTyping = false;
    this.isReady = false;

    this.createAnimations();
    this.cameras.main.setBackgroundColor(COLORS.background);
    this.createBackdrop();
    this.createDialogue();
    this.input.on('pointerdown', this.advanceDialogue, this);
    this.input.keyboard.on('keydown', this.handleKeyDown, this);
    this.showPage();
  }

  createAnimations() {
    const animations = [
      { key: 'hera-intro-idle', texture: 'hera-idle', end: 7, frameRate: 8 },
      { key: 'hera-intro-speaking', texture: 'hera-speaking', end: 6, frameRate: 6 },
    ];

    for (const animation of animations) {
      if (this.anims.exists(animation.key)) continue;

      this.anims.create({
        key: animation.key,
        frames: this.anims.generateFrameNumbers(animation.texture, {
          start: 0,
          end: animation.end,
        }),
        frameRate: animation.frameRate,
        repeat: -1,
      });
    }
  }

  createBackdrop() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x3b1f50, 0.35);
    for (let x = 16; x < WIDTH; x += 32) {
      graphics.lineBetween(x, 0, x, HEIGHT);
    }
    for (let y = 16; y < HEIGHT; y += 32) {
      graphics.lineBetween(0, y, WIDTH, y);
    }

    this.add.text(WIDTH / 2, 75, 'ALERTA DA REDE KYBER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#f5d56b',
      resolution: 2,
    }).setOrigin(0.5);
  }

  createDialogue() {
    this.add.nineslice(
      105,
      330,
      'intro-portrait-frame',
      undefined,
      176,
      176,
      5,
      5,
      5,
      5,
    );
    this.hera = this.add.sprite(105, 330, 'hera-idle')
      .setDisplaySize(144, 144)
      .play('hera-intro-idle');

    this.add.nineslice(
      488,
      330,
      'intro-dialog-box',
      undefined,
      590,
      230,
      5,
      5,
      5,
      5,
    );
    this.add.nineslice(
      283,
      215,
      'intro-name-tag',
      undefined,
      170,
      42,
      3,
      3,
      3,
      3,
    );
    this.add.text(283, 215, 'HERA', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: COLORS.text,
      resolution: 2,
    }).setOrigin(0.5);

    this.dialogueText = this.add.text(218, 250, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '17px',
      color: COLORS.text,
      resolution: 2,
      lineSpacing: 8,
      wordWrap: { width: 535 },
    });
    this.prompt = this.add.text(758, 424, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: COLORS.muted,
      resolution: 2,
    }).setOrigin(1, 0);
  }

  getPages() {
    const isLeia = this.character.id === 'leia';
    const player = isLeia ? 'Jogadora' : 'Jogador';
    const summoned = isLeia ? 'convocada' : 'convocado';
    const guardian = isLeia ? 'nova Guardiã' : 'novo Guardião';

    return [
      'Alerta Vermelho! A Rede Kyber sofreu uma brecha no perímetro e está sob ataque massivo de Invasores cibernéticos.',
      `${player}, você foi ${summoned} como ${guardian} Firewall! Sua missão é blindar o sistema e proteger a privacidade dos usuários antes que os Invasores dominem o servidor central. Contamos com você!`,
    ];
  }

  showPage() {
    const pages = this.getPages();
    const page = pages[this.pageIndex];

    this.isReady = false;
    this.isTyping = true;
    this.prompt.setText('CLIQUE OU ENTER PARA AVANÇAR');
    this.hera.play('hera-intro-speaking');
    this.dialogueText.setText('');
    this.typeIndex = 1;
    this.dialogueText.setText(page.slice(0, this.typeIndex));
    this.typewriterEvent = this.time.addEvent({
      delay: 28,
      repeat: page.length - this.typeIndex - 1,
      callback: () => {
        this.typeIndex += 1;
        this.dialogueText.setText(page.slice(0, this.typeIndex));
        if (this.typeIndex === page.length) {
          this.typewriterEvent.remove();
          this.typewriterEvent = null;
          this.isTyping = false;
          this.hera.play('hera-intro-idle');
        }
      },
    });
  }

  advanceDialogue() {
    if (this.isReady) {
      this.scene.start(this.nextScene, { personagem: this.character.id });
      return;
    }

    if (this.isTyping) {
      this.typewriterEvent?.remove();
      this.typewriterEvent = null;
      this.dialogueText.setText(this.getPages()[this.pageIndex]);
      this.isTyping = false;
      this.hera.play('hera-intro-idle');
      return;
    }

    this.pageIndex += 1;
    if (this.pageIndex >= this.getPages().length) {
      this.isReady = true;
      this.prompt.setText('CLIQUE OU ENTER PARA COMEÇAR');
      return;
    }

    this.showPage();
  }

  handleKeyDown(event) {
    if (!event.repeat && (event.key === 'Enter' || event.key === ' ')) {
      this.advanceDialogue();
    }
  }
}
