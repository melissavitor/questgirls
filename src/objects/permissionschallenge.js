import Phaser from 'phaser';

const PERMISSION_LABELS = {
  storage: 'ARMAZENAMENTO',
  camera: 'CAMERA',
  contacts: 'CONTATOS',
  location: 'LOCALIZACAO',
  microphone: 'MICROFONE',
  sms: 'SMS',
  phone: 'TELEFONE',
};

const APPS = [
  {
    name: 'CALCULADORA',
    texture: 'app-calculator',
    description: 'Uma calculadora simples quer acessar seus contatos.',
    permissions: ['contacts'],
    allow: false,
  },
  {
    name: 'CARTEIRA KYBER',
    texture: 'app-wallet',
    description: 'A carteira digital pede camera para ler QR codes e armazenamento para guardar recibos.',
    permissions: ['camera', 'storage'],
    allow: true,
  },
  {
    name: 'CLIMA',
    texture: 'app-weather',
    description: 'O aplicativo de clima pede localizacao para mostrar a previsao da sua regiao.',
    permissions: ['location'],
    allow: true,
  },
  {
    name: 'FOTOS',
    texture: 'app-photos',
    description: 'O editor de fotos precisa de camera e armazenamento para capturar e salvar imagens.',
    permissions: ['camera', 'storage'],
    allow: true,
  },
  {
    name: 'JOGO PIXEL',
    texture: 'app-game',
    description: 'Um jogo offline pede microfone e localizacao, sem explicar por que precisa deles.',
    permissions: ['microphone', 'location'],
    allow: false,
  },
  {
    name: 'LANTERNA',
    texture: 'app-flashlight',
    description: 'A lanterna precisa da camera para controlar o flash do aparelho.',
    permissions: ['camera'],
    allow: true,
  },
  {
    name: 'MENSAGENS',
    texture: 'app-messages',
    description: 'O app de mensagens pede contatos e SMS para encontrar pessoas e enviar mensagens.',
    permissions: ['contacts', 'sms'],
    allow: true,
  },
  {
    name: 'MUSICA',
    texture: 'app-music',
    description: 'O tocador de musica pede armazenamento para acessar as faixas salvas no aparelho.',
    permissions: ['storage'],
    allow: true,
  },
  {
    name: 'FOTO PREMIADA',
    texture: 'app-spy',
    description: 'Um app espião disfarçado de editor pede acesso a dados que nao precisa para funcionar.',
    permissions: ['camera', 'contacts', 'location', 'microphone', 'phone', 'sms', 'storage'],
    allow: false,
  },
];

const COLORS = {
  cyan: '#3fd0e0',
  magenta: '#ff3fa4',
  white: '#ffffff',
  muted: '#b6a9cf',
};

export default class PermissionsChallenge {
  constructor(scene, onComplete, onLifeLost) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.onLifeLost = onLifeLost;
    this.index = 0;
    this.locked = false;
    this.layer = scene.add.container(0, 0).setScrollFactor(0).setDepth(30000);
    scene.cameras.main.ignore(this.layer);
    this.createPanel();
    this.showApp();
  }

  add(object) {
    this.layer.add(object);
    return object;
  }

  createPanel() {
    this.add(this.scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.8));
    this.add(this.scene.add.nineslice(
      400, 300, 'permission-panel', undefined, 720, 550, 5, 5, 5, 5,
    ));
    this.add(this.scene.add.text(400, 48, 'LOJA DE APLICATIVOS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: COLORS.white,
      resolution: 2,
    }).setOrigin(0.5));
    this.progressLabel = this.add(this.scene.add.text(400, 82, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: COLORS.cyan,
      resolution: 2,
    }).setOrigin(0.5));

    this.appIcon = this.add(this.scene.add.image(152, 151, 'app-calculator')
      .setDisplaySize(64, 64));
    this.appName = this.add(this.scene.add.text(204, 124, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: COLORS.cyan,
      resolution: 2,
    }));
    this.description = this.add(this.scene.add.text(204, 151, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: COLORS.white,
      resolution: 2,
      lineSpacing: 5,
      wordWrap: { width: 470 },
    }));
    this.add(this.scene.add.text(400, 235, 'PERMISSOES SOLICITADAS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: COLORS.muted,
      resolution: 2,
    }).setOrigin(0.5));
    this.permissionRows = [];
    for (let index = 0; index < 7; index += 1) {
      const y = 266 + index * 28;
      const icon = this.add(this.scene.add.image(260, y, 'permission-storage')
        .setDisplaySize(18, 18));
      const label = this.add(this.scene.add.text(280, y, '', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: COLORS.white,
        resolution: 2,
      }).setOrigin(0, 0.5));
      this.permissionRows.push({ icon, label });
    }
    this.statusLabel = this.add(this.scene.add.text(400, 478, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: COLORS.white,
      resolution: 2,
      align: 'center',
      wordWrap: { width: 620 },
    }).setOrigin(0.5));
    this.acceptButton = this.createButton(300, 'permission-accept', true);
    this.denyButton = this.createButton(500, 'permission-deny', false);
  }

  createButton(x, texture, allow) {
    const button = this.add(this.scene.add.image(x, 529, texture, 0)
      .setInteractive({ useHandCursor: true }));
    button.on('pointerover', () => button.setFrame(1));
    button.on('pointerout', () => button.setFrame(0));
    button.on('pointerdown', () => {
      this.scene.sound.play('ui-click', { volume: 0.35 });
      this.answer(allow);
    });
    return button;
  }

  showApp() {
    const app = APPS[this.index];
    this.progressLabel.setText(`APLICATIVO ${this.index + 1} / ${APPS.length}`);
    this.appIcon.setTexture(app.texture);
    this.appName.setText(app.name);
    this.description.setText(app.description);
    this.permissionRows.forEach(({ icon, label }, index) => {
      const permission = app.permissions[index];
      const y = 340 + (index - (app.permissions.length - 1) / 2) * 28;
      icon.setY(y);
      label.setY(y);
      icon.setVisible(Boolean(permission));
      label.setVisible(Boolean(permission));
      if (permission) {
        icon.setTexture(`permission-${permission}`);
        label.setText(PERMISSION_LABELS[permission]);
      }
    });
    this.statusLabel.setText('ACEITE SOMENTE ACESSOS NECESSARIOS PARA A FUNCAO DO APP.');
    this.statusLabel.setColor(COLORS.white);
    this.locked = false;
  }

  answer(allow) {
    if (this.locked) return;
    const app = APPS[this.index];
    if (allow !== app.allow) {
      const lives = this.onLifeLost();
      if (lives === 0) return;
      this.statusLabel.setText(
        `ACESSO INADEQUADO. ${lives} VIDA(S) RESTANTE(S). REAVALIE AS PERMISSOES.`,
      );
      this.statusLabel.setColor(COLORS.magenta);
      return;
    }

    this.locked = true;
    this.statusLabel.setText(allow
      ? 'ACESSO NECESSARIO. BOA ESCOLHA!'
      : 'PEDIDO EXCESSIVO. ACESSO NEGADO!');
    this.statusLabel.setColor(COLORS.cyan);
    this.scene.time.delayedCall(700, () => {
      this.index += 1;
      if (this.index === APPS.length) {
        this.destroy();
        this.onComplete();
        return;
      }
      this.showApp();
    });
  }

  destroy() {
    this.layer.destroy(true);
  }

  lockForGameOver() {
    this.locked = true;
    this.layer.list.forEach((object) => object.disableInteractive?.());
  }
}
