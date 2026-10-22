import Phaser from 'phaser';

const EMAILS = [
  {
    sender: 'suporte@redekyber.com',
    subject: 'Atualização de segurança disponível',
    body: 'A atualização mensal está pronta. Consulte o portal oficial da Rede Kyber para ver as instruções.',
    isScam: false,
  },
  {
    sender: 'premio-incrivel@promo-oferta.co',
    subject: 'Você ganhou um console! Resgate agora',
    body: 'Acesse bit.ly/premio-hoje e informe sua senha em 10 minutos para não perder o prêmio.',
    isScam: true,
  },
  {
    sender: 'equipe@biblioteca.kyber',
    subject: 'Confirmação de empréstimo',
    body: 'Seu livro digital está disponível na biblioteca. Entre no aplicativo para consultar seus empréstimos.',
    isScam: false,
  },
  {
    sender: 'alerta@conta-protegida-login.net',
    subject: 'Sua conta será bloqueada!',
    body: 'Detectamos um problema. Clique no link encurtado e confirme seus dados imediatamente.',
    isScam: true,
  },
  {
    sender: 'noticias@redekyber.com',
    subject: 'Boletim semanal da Rede Kyber',
    body: 'Confira as novidades desta semana no site oficial. Você pode cancelar o recebimento quando quiser.',
    isScam: false,
  },
];

const COLORS = {
  cyan: '#3fd0e0',
  magenta: '#ff3fa4',
  white: '#ffffff',
  muted: '#b6a9cf',
};

export default class EmailChallenge {
  constructor(scene, onComplete, onLifeLost) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.onLifeLost = onLifeLost;
    this.index = 0;
    this.locked = false;
    this.layer = scene.add.container(0, 0).setScrollFactor(0).setDepth(30000);
    scene.cameras.main.ignore(this.layer);
    this.createPanel();
    this.showEmail();
  }

  add(object) {
    this.layer.add(object);
    return object;
  }

  createPanel() {
    this.add(this.scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.78));
    this.add(this.scene.add.nineslice(
      400, 300, 'email-card', undefined, 720, 550, 5, 5, 5, 5,
    ));
    this.add(this.scene.add.text(400, 48, 'TRIAGEM DE MENSAGENS', {
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
    this.senderLabel = this.add(this.scene.add.text(142, 143, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: COLORS.cyan,
      resolution: 2,
      wordWrap: { width: 520 },
    }));
    this.subjectLabel = this.add(this.scene.add.text(142, 184, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: COLORS.white,
      resolution: 2,
      wordWrap: { width: 520 },
    }));
    this.bodyLabel = this.add(this.scene.add.text(142, 232, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: COLORS.muted,
      resolution: 2,
      lineSpacing: 7,
      wordWrap: { width: 510 },
    }));
    this.clueIcon = this.add(this.scene.add.image(632, 330, 'email-suspect-link')
      .setDisplaySize(56, 56));
    this.statusLabel = this.add(this.scene.add.text(400, 431, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: COLORS.white,
      resolution: 2,
      align: 'center',
      wordWrap: { width: 610 },
    }).setOrigin(0.5));
    this.safeButton = this.createButton(300, 'email-safe-button', 'safe');
    this.scamButton = this.createButton(500, 'email-scam-button', 'scam');
  }

  createButton(x, texture, answer) {
    const button = this.add(this.scene.add.image(x, 520, texture, 0)
      .setInteractive({ useHandCursor: true }));
    button.on('pointerover', () => button.setFrame(1));
    button.on('pointerout', () => button.setFrame(0));
    button.on('pointerdown', () => {
      this.scene.sound.play('ui-click', { volume: 0.35 });
      this.answer(answer);
    });
    return button;
  }

  showEmail() {
    const email = EMAILS[this.index];
    this.progressLabel.setText(`MENSAGEM ${this.index + 1} / ${EMAILS.length}`);
    this.senderLabel.setText(`DE: ${email.sender}`);
    this.subjectLabel.setText(`ASSUNTO: ${email.subject}`);
    this.bodyLabel.setText(email.body);
    this.clueIcon.setTexture(email.isScam ? 'email-fishing' : 'email-open');
    this.statusLabel.setText('ESTA MENSAGEM E SEGURA OU E UM GOLPE?');
    this.statusLabel.setColor(COLORS.white);
    this.locked = false;
  }

  answer(answer) {
    if (this.locked) return;
    const email = EMAILS[this.index];
    const correct = (answer === 'scam') === email.isScam;
    if (!correct) {
      const lives = this.onLifeLost();
      if (lives === 0) return;
      this.statusLabel.setText(
        `INCORRETO. ${lives} VIDA(S) RESTANTE(S). OBSERVE REMETENTE, URGENCIA E LINKS.`,
      );
      this.statusLabel.setColor(COLORS.magenta);
      return;
    }

    this.locked = true;
    this.statusLabel.setText(email.isScam ? 'GOLPE IDENTIFICADO!' : 'MENSAGEM SEGURA IDENTIFICADA!');
    this.statusLabel.setColor(COLORS.cyan);
    this.scene.time.delayedCall(700, () => {
      this.index += 1;
      if (this.index === EMAILS.length) {
        this.destroy();
        this.onComplete();
        return;
      }
      this.showEmail();
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
