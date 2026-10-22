import Phaser from 'phaser';

const WIDTH = 800;
const HEIGHT = 600;
const TIME_LIMIT = 60;
const CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?-_+=';
const BASE_TEXTURES = [
  'password-base-lower',
  'password-base-upper',
  'password-base-number',
  'password-base-symbol',
];

const COLORS = {
  panel: 0x100c1a,
  white: '#ffffff',
  cyan: 0x3fd0e0,
  magenta: 0xff3fa4,
  amber: 0xf5d56b,
  muted: '#b6a9cf',
};

function toTextColor(color) {
  return typeof color === 'number'
    ? `#${color.toString(16).padStart(6, '0')}`
    : color;
}

export default class PasswordChallenge {
  constructor(scene, { onComplete, onLifeLost }) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.onLifeLost = onLifeLost;
    this.password = '';
    this.remainingSeconds = TIME_LIMIT;
    this.isExpired = false;
    this.isComplete = false;
    this.tiles = [];
    this.layer = scene.add.container(0, 0)
      .setScrollFactor(0)
      .setDepth(30000);
    scene.cameras.main.ignore(this.layer);

    this.createPanel();
    this.createPasswordField();
    this.createCharacterTiles();
    this.createControls();
    this.updatePassword();
    this.updateTimerLabel();
    this.timer = scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: this.tick,
      callbackScope: this,
    });
  }

  add(object) {
    this.layer.add(object);
    return object;
  }

  createPanel() {
    this.add(this.scene.add.rectangle(
      WIDTH / 2,
      HEIGHT / 2,
      WIDTH,
      HEIGHT,
      0x000000,
      0.78,
    ));
    this.add(this.scene.add.nineslice(
      WIDTH / 2,
      HEIGHT / 2,
      'password-field',
      undefined,
      720,
      580,
      5,
      5,
      5,
      5,
    ));

    this.add(this.scene.add.text(WIDTH / 2, 42, 'DESAFIO: SENHA FORTE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '17px',
      color: COLORS.white,
      resolution: 2,
    }).setOrigin(0.5));

    this.add(this.scene.add.image(337, 91, 'password-clock').setDisplaySize(32, 32));
    this.timerLabel = this.add(this.scene.add.text(370, 91, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: COLORS.white,
      resolution: 2,
    }).setOrigin(0, 0.5));
  }

  createPasswordField() {
    this.add(this.scene.add.nineslice(
      WIDTH / 2,
      151,
      'password-field',
      undefined,
      610,
      68,
      5,
      5,
      5,
      5,
    ));
    this.lockIcon = this.add(this.scene.add.image(123, 151, 'password-lock-weak')
      .setDisplaySize(38, 38));
    this.passwordText = this.add(this.scene.add.text(158, 151, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '15px',
      color: COLORS.white,
      resolution: 2,
    }).setOrigin(0, 0.5));
    this.lengthLabel = this.add(this.scene.add.text(676, 151, '0/12', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: COLORS.muted,
      resolution: 2,
    }).setOrigin(1, 0.5));

    this.statusLabel = this.add(this.scene.add.text(
      WIDTH / 2,
      205,
      'USE 12+ CARACTERES: MAIÚSCULAS, MINÚSCULAS, NÚMEROS E SÍMBOLOS',
      {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: COLORS.muted,
        resolution: 2,
        align: 'center',
      },
    ).setOrigin(0.5));
  }

  createCharacterTiles() {
    const startX = 211;
    const startY = 244;
    const spacing = 38;
    const categoryFor = (index) => (
      index < 26 ? 0 : index < 52 ? 1 : index < 62 ? 2 : 3
    );

    [...CHARACTERS].forEach((character, index) => {
      const column = index % 10;
      const row = Math.floor(index / 10);
      const x = startX + column * spacing;
      const y = startY + row * spacing;
      const base = this.add(this.scene.add.sprite(
        x,
        y,
        BASE_TEXTURES[categoryFor(index)],
        0,
      ).setInteractive({ useHandCursor: true }));
      this.add(this.scene.add.image(x, y, 'password-characters', index));

      base.on('pointerover', () => base.setFrame(1));
      base.on('pointerout', () => base.setFrame(0));
      base.on('pointerdown', () => {
        this.scene.sound.play('ui-click', { volume: 0.35 });
        this.appendCharacter(character);
      });
      this.tiles.push(base);
    });
  }

  createControls() {
    this.createButton(220, 555, 155, 'APAGAR', () => this.removeCharacter(), COLORS.magenta);
    this.createButton(400, 555, 155, 'LIMPAR', () => this.clearPassword(), COLORS.amber);
    this.createButton(580, 555, 195, 'VALIDAR SENHA', () => this.validate(), COLORS.cyan);
  }

  createButton(x, y, width, label, action, color, allowExpired = false) {
    const background = this.add(this.scene.add.rectangle(
      x,
      y,
      width,
      42,
      COLORS.panel,
      1,
    ).setStrokeStyle(2, color));
    const text = this.add(this.scene.add.text(x, y, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: COLORS.white,
      resolution: 2,
    }).setOrigin(0.5));
    const hitArea = this.add(this.scene.add.zone(x, y, width, 42)
      .setInteractive({ useHandCursor: true }));

    hitArea.on('pointerover', () => background.setFillStyle(0x2a2037));
    hitArea.on('pointerout', () => background.setFillStyle(COLORS.panel));
    hitArea.on('pointerdown', () => {
      if (allowExpired || (!this.isExpired && !this.isComplete)) {
        this.scene.sound.play('ui-click', { volume: 0.35 });
        action();
      }
    });
    return [background, text, hitArea];
  }

  appendCharacter(character) {
    if (this.isExpired || this.isComplete) return;
    if (this.password.length >= 16) {
      this.setStatus('LIMITE DE 16 CARACTERES.', COLORS.amber);
      return;
    }

    this.password += character;
    this.updatePassword();
  }

  removeCharacter() {
    this.password = this.password.slice(0, -1);
    this.updatePassword();
  }

  clearPassword() {
    this.password = '';
    this.updatePassword();
  }

  updatePassword() {
    this.passwordText.setText(this.password || 'TOQUE NOS BLOCOS ABAIXO');
    this.passwordText.setColor(this.password ? COLORS.white : COLORS.muted);
    this.lengthLabel.setText(`${this.password.length}/12`);
    this.lockIcon.setTexture(this.isStrongPassword() ? 'password-lock-strong' : 'password-lock-weak');

    if (this.password.length >= 12) {
      this.setStatus(
        this.isStrongPassword()
          ? 'SENHA FORTE! AGORA VALIDE.'
          : 'ADICIONE LETRAS, NUMEROS E SIMBOLOS.',
        this.isStrongPassword() ? COLORS.cyan : COLORS.amber,
      );
    } else {
      this.setStatus('USE 12+ CARACTERES: MAIUSCULAS, MINUSCULAS, NUMEROS E SIMBOLOS', COLORS.muted);
    }
  }

  isStrongPassword() {
    return this.password.length >= 12
      && /[a-z]/.test(this.password)
      && /[A-Z]/.test(this.password)
      && /\d/.test(this.password)
      && /[^A-Za-z0-9]/.test(this.password);
  }

  setStatus(message, color) {
    this.statusLabel.setText(message);
    this.statusLabel.setColor(toTextColor(color));
  }

  validate() {
    if (this.isStrongPassword()) {
      this.isComplete = true;
      this.timer.remove();
      this.onComplete();
      return;
    }

    const lives = this.onLifeLost();
    if (lives === 0) return;
    this.setStatus(
      `SENHA FRACA. ${lives} VIDA(S) RESTANTE(S). USE 12+ E OS 4 TIPOS DE CARACTERE.`,
      COLORS.magenta,
    );
  }

  tick() {
    if (this.isExpired || this.isComplete) return;
    this.remainingSeconds -= 1;
    this.updateTimerLabel();

    if (this.remainingSeconds <= 0) {
      this.isExpired = true;
      this.lives = this.onLifeLost();
      if (this.lives === 0) return;
      this.tiles.forEach((tile) => tile.disableInteractive());
      this.setStatus('TEMPO ESGOTADO! TENTE NOVAMENTE.', COLORS.magenta);

      this.createButton(
        WIDTH / 2,
        555,
        230,
        'TENTAR NOVAMENTE',
        () => this.retry(),
        COLORS.cyan,
        true,
      );
    }
  }

  updateTimerLabel() {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    this.timerLabel.setText(
      `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    );
    this.timerLabel.setColor(toTextColor(
      this.remainingSeconds <= 10 ? COLORS.magenta : COLORS.white,
    ));
  }

  retry() {
    this.password = '';
    this.remainingSeconds = TIME_LIMIT;
    this.isExpired = false;
    this.tiles.forEach((tile) => tile.setInteractive({ useHandCursor: true }).setFrame(0));
    this.updatePassword();
    this.updateTimerLabel();
    this.timer.paused = false;
    this.removeRetryButton();
  }

  removeRetryButton() {
    this.layer.list.slice(-3).forEach((object) => object.destroy());
  }

  destroy() {
    this.timer?.remove();
    this.layer.destroy(true);
  }

  lockForGameOver() {
    this.isExpired = true;
    this.timer?.remove();
    this.layer.list.forEach((object) => object.disableInteractive?.());
  }
}
