import Phaser from 'phaser';
import { CHARACTERS, CREDITS, MENU_ASSETS, START_SCENE } from '../config/menuData.js';

const WIDTH = 320;
const HEIGHT = 180;
const STAGE_SCALE = 2.5;
const STAGE_TOP = 75;

const COLORS = {
  background: 0x0d0b14,
  panel: 0x150f22,
  panelEdge: 0x3b1f50,
  cyan: 0x3fd0e0,
  magenta: 0xff3fa4,
  amber: 0xf5d56b,
  text: '#e2e2ea',
  muted: '#8b78ad',
};

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.createCharacterAnimations();
    this.stage = this.add.container(0, STAGE_TOP).setScale(STAGE_SCALE);
    this.createBackground();

    this.mainScreen = this.add.container(0, 0);
    this.characterScreen = this.add.container(0, 0);
    this.creditsScreen = this.add.container(0, 0);
    this.stage.add([this.mainScreen, this.characterScreen, this.creditsScreen]);

    this.createMainScreen();
    this.createCharacterScreen();
    this.createCreditsScreen();
    this.configureInput();
    this.showScreen('main');
    this.cameras.main.fadeIn(300, 13, 11, 20);
  }

  createBackground() {
    this.stage.add(
      this.add.rectangle(0, 0, WIDTH, HEIGHT, COLORS.background).setOrigin(0),
    );

    const grid = this.add.graphics();
    grid.lineStyle(1, COLORS.panelEdge, 0.34);
    for (let x = 16; x < WIDTH; x += 16) {
      grid.lineBetween(x, 0, x, HEIGHT);
    }
    for (let y = 16; y < HEIGHT; y += 16) {
      grid.lineBetween(0, y, WIDTH, y);
    }
    this.stage.add(grid);

    this.binaryColumns = [];
    for (let column = 0; column < 16; column += 1) {
      const text = this.add.text(
        8 + column * 20,
        Phaser.Math.Between(-80, HEIGHT),
        Array.from({ length: 4 }, () => Phaser.Math.Between(0, 1)).join('\n'),
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '6px',
          color: column % 3 === 0 ? '#3fd0e0' : '#6b3fa0',
          lineSpacing: 2,
        },
      ).setAlpha(0.2);
      text.speed = Phaser.Math.Between(8, 20);
      this.binaryColumns.push(text);
    }
    this.stage.add(this.binaryColumns);
  }

  createMainScreen() {
    const logo = this.add.image(WIDTH / 2, 48, MENU_ASSETS.logo).setScale(0.6);
    this.mainScreen.add(logo);

    this.mainScreen.add(this.add.text(WIDTH / 2, 91, 'REDE KYBER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#f5d56b',
    }).setOrigin(0.5));

    this.playButton = this.createButton(
      this.mainScreen,
      WIDTH / 2,
      121,
      MENU_ASSETS.playButton,
      () => this.showScreen('characters'),
    );
    this.creditsButton = this.createButton(
      this.mainScreen,
      WIDTH / 2,
      153,
      MENU_ASSETS.creditsButton,
      () => this.showScreen('credits'),
    );
    this.mainButtons = [this.playButton, this.creditsButton];

    this.mainScreen.add(this.add.text(WIDTH / 2, 174, 'SETAS / WASD · ENTER: OK', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '5px',
      color: COLORS.muted,
    }).setOrigin(0.5));
  }

  createCharacterScreen() {
    this.characterScreen.add(this.add.text(WIDTH / 2, 17, 'ESCOLHA SEU PERSONAGEM', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#f5d56b',
    }).setOrigin(0.5));

    this.characterCards = CHARACTERS.map((character, index) => {
      const x = 44 + index * 126;
      const y = 30;
      const cardWidth = 106;
      const cardHeight = 104;
      const card = this.add.container(x, y);
      const frame = this.add.graphics();

      frame.fillStyle(COLORS.panel, 0.96).fillRect(0, 0, cardWidth, cardHeight);
      const portrait = this.add.sprite(53, 35, character.image)
        .setDisplaySize(48, 48)
        .play(character.animation);
      const name = this.add.text(53, 67, character.name, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px',
        color: `#${character.color.toString(16).padStart(6, '0')}`,
        resolution: STAGE_SCALE,
      }).setOrigin(0.5);
      const description = this.add.text(53, 83, character.description, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '6px',
        color: COLORS.text,
        align: 'center',
        lineSpacing: 3,
        resolution: STAGE_SCALE,
      }).setOrigin(0.5, 0);

      card.add([frame, portrait, name, description]);
      const zone = this.add.zone(x, y, cardWidth, cardHeight)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true });
      zone.on('pointerover', () => {
        this.characterFocus = index;
        this.drawCharacterCards();
      });
      zone.on('pointerup', () => this.selectCharacter(index));
      this.characterScreen.add([card, zone]);

      return { frame, character };
    });

    this.backButton = this.createButton(
      this.characterScreen,
      101,
      159,
      MENU_ASSETS.backButton,
      () => this.showScreen('main'),
      0.7,
    );
    this.continueButton = this.createButton(
      this.characterScreen,
      219,
      159,
      MENU_ASSETS.continueButton,
      () => this.startGame(),
      0.7,
    );
    this.continueButton.disabled = true;
    this.drawButton(this.continueButton);
  }

  createCharacterAnimations() {
    for (const character of CHARACTERS) {
      if (this.anims.exists(character.animation)) continue;

      this.anims.create({
        key: character.animation,
        frames: this.anims.generateFrameNumbers(character.image, {
          start: 0,
          end: 12,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }
  }

  createCreditsScreen() {
    const panel = this.add.graphics();
    panel.fillStyle(COLORS.panel, 0.96);
    panel.fillRect(14, 39, 292, 105);
    panel.lineStyle(1, COLORS.panelEdge, 1);
    panel.strokeRect(14, 39, 292, 105);
    this.creditsScreen.add(panel);

    this.creditsScreen.add(this.add.text(WIDTH / 2, 23, 'CRÉDITOS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#f5d56b',
    }).setOrigin(0.5));

    const credits = this.add.text(WIDTH / 2, 44, CREDITS.filter(Boolean).join('\n'), {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: COLORS.text,
      align: 'center',
      lineSpacing: 2,
      resolution: STAGE_SCALE,
      wordWrap: { width: 278 },
    }).setOrigin(0.5, 0);
    this.creditsScreen.add(credits);

    this.createButton(
      this.creditsScreen,
      WIDTH / 2,
      158,
      MENU_ASSETS.backButton,
      () => this.showScreen('main'),
      0.7,
    );
  }

  createButton(container, x, y, texture, action, scale = 0.78) {
    const button = {
      sprite: this.add.sprite(x, y, texture, 0)
        .setScale(scale)
        .setInteractive({ useHandCursor: true }),
      action,
      disabled: false,
      focused: false,
      pressed: false,
    };

    button.sprite.on('pointerover', () => {
      button.focused = true;
      this.drawButton(button);
    });
    button.sprite.on('pointerout', () => {
      button.focused = false;
      button.pressed = false;
      this.drawButton(button);
    });
    button.sprite.on('pointerdown', () => {
      if (button.disabled) return;
      button.pressed = true;
      this.drawButton(button);
    });
    button.sprite.on('pointerup', () => {
      const wasPressed = button.pressed;
      button.pressed = false;
      this.drawButton(button);
      if (wasPressed && !button.disabled) button.action();
    });

    container.add(button.sprite);
    return button;
  }

  drawButton(button) {
    button.sprite.setFrame(
      button.disabled ? 3 : button.pressed ? 2 : button.focused ? 1 : 0,
    );
  }

  drawCharacterCards() {
    this.characterCards.forEach(({ frame, character }, index) => {
      frame.clear();
      frame.fillStyle(COLORS.panel, 0.96).fillRect(0, 0, 106, 104);
      frame.lineStyle(index === this.characterFocus ? 2 : 1, character.color, 1);
      frame.strokeRect(1, 1, 104, 102);
      if (index === this.selectedCharacter) {
        frame.fillStyle(character.color, 1).fillRect(6, 6, 4, 4);
      }
    });
  }

  selectCharacter(index) {
    this.characterFocus = index;
    this.selectedCharacter = index;
    this.continueButton.disabled = false;
    this.drawButton(this.continueButton);
    this.drawCharacterCards();
  }

  showScreen(name) {
    this.activeScreen = name;
    this.mainScreen.setVisible(name === 'main');
    this.characterScreen.setVisible(name === 'characters');
    this.creditsScreen.setVisible(name === 'credits');

    if (name === 'main') {
      this.mainFocus = 0;
      this.updateMainFocus();
    } else if (name === 'characters') {
      this.characterFocus = 0;
      this.characterFocusTarget = 'cards';
      this.selectedCharacter = null;
      this.continueButton.disabled = true;
      this.drawCharacterCards();
      this.drawButton(this.continueButton);
    }
  }

  updateMainFocus() {
    this.mainButtons.forEach((button, index) => {
      button.focused = index === this.mainFocus;
      this.drawButton(button);
    });
  }

  configureInput() {
    this.input.keyboard.on('keydown', this.handleKeyDown, this);
  }

  handleKeyDown(event) {
    const key = event.key.toLowerCase();
    if (this.activeScreen === 'main') {
      if (['arrowup', 'arrowdown', 'w', 's'].includes(key)) {
        this.mainFocus = 1 - this.mainFocus;
        this.updateMainFocus();
      } else if (key === 'enter' || key === ' ') {
        this.mainButtons[this.mainFocus].action();
      }
      return;
    }

    if (key === 'escape' || key === 'backspace') {
      this.showScreen('main');
      return;
    }

    if (this.activeScreen === 'characters') {
      if (['arrowleft', 'arrowright', 'a', 'd'].includes(key)) {
        const direction = ['arrowleft', 'a'].includes(key) ? -1 : 1;
        this.characterFocus = Phaser.Math.Wrap(
          this.characterFocus + direction,
          0,
          CHARACTERS.length,
        );
        this.drawCharacterCards();
      } else if (key === 'arrowup' || key === 'w') {
        this.characterFocusTarget = 'cards';
      } else if (key === 'arrowdown' || key === 's') {
        this.characterFocusTarget = 'continue';
      } else if (key === 'enter' || key === ' ') {
        if (this.characterFocusTarget === 'continue' && this.selectedCharacter !== null) {
          this.startGame();
        } else {
          this.selectCharacter(this.characterFocus);
          this.characterFocusTarget = 'continue';
        }
      }
    } else if (this.activeScreen === 'credits' && (key === 'enter' || key === ' ')) {
      this.showScreen('main');
    }
  }

  startGame() {
    if (this.selectedCharacter === null) return;

    const character = CHARACTERS[this.selectedCharacter];
    this.registry.set('personagem', character.id);
    this.registry.set('selectedCharacter', character.id);
    this.registry.set('lives', 3);
    this.scene.start('IntroScene', {
      personagem: character.id,
      nextScene: START_SCENE,
    });
  }

  update(_time, delta) {
    const seconds = delta / 1000;
    for (const column of this.binaryColumns) {
      column.y += column.speed * seconds;
      if (column.y > HEIGHT) {
        column.y = -column.height - Phaser.Math.Between(0, 30);
      }
    }
  }
}
