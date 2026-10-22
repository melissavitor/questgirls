import Phaser from 'phaser';
import { playBackgroundMusic } from '../audio/backgroundMusic.js';
import { createVolumeControl } from '../ui/volumeControl.js';

const WIDTH = 800;
const HEIGHT = 600;
const ARENA = { left: 220, right: 580, top: 196, bottom: 416 };
const ACTIONS = [
  { id: 'analisar', key: 'boss-action-analyze', hotkey: 'a' },
  { id: 'defender', key: 'boss-action-defend', hotkey: 'd' },
  { id: 'denunciar', key: 'boss-action-report', hotkey: 'r' },
  { id: 'item', key: 'boss-action-item', hotkey: 'i' },
];
const QUIZZES = [
  {
    question: 'Para criar uma senha realmente forte contra ataques de força bruta, qual é a combinação ideal?',
    answers: [
      'Uma palavra curta fácil de lembrar, usando seu nome e ano de nascimento.',
      'Uma frase ou combinação longa contendo letras maiúsculas, minúsculas, números e símbolos especiais (!@#$).',
      'Apenas números, desde que tenham mais de 10 dígitos sequenciais (ex: 1234567890).',
      'A mesma senha para todas as suas contas, para garantir que você nunca vai esquecer.',
    ],
    correct: 1,
    healthOnMiss: 80,
    intro: 'Você acha mesmo que bloqueou meu ataque? Vamos ver se sabe proteger a autenticação da Rede Kyber!',
    wrong: 'Hahaha! Resposta errada! Meu programa de força bruta adivinhou sua senha em 2 segundos! Tomando a rede de volta!',
    guidance: 'Senhas curtas, datas e padrões são os primeiros alvos. Senhas longas com caracteres variados são muito mais difíceis de quebrar!',
    right: 'O quê?! Como você sabia disso?! Argh... meu firewall de invasão caiu!',
    praise: 'Excelente, Guardiã! A autenticação está blindada. Preparar para a próxima investida!',
  },
  {
    question: 'Você recebe: “Urgente! Seu banco bloqueou sua conta. Clique no link para recadastrar seus dados ou perderá o acesso em 1 hora!”. Como deve agir?',
    answers: [
      'Clicar no link imediatamente para resolver o problema o mais rápido possível.',
      'Responder à mensagem pedindo para falar diretamente com o atendente do banco.',
      'Ignorar e não clicar. Se houver dúvida, contatar o banco pelos canais e aplicativos oficiais.',
      'Encaminhar a mensagem para todos os seus amigos para avisar sobre o problema no banco.',
    ],
    correct: 2,
    healthOnMiss: 50,
    intro: 'Chega de brincadeiras! Você sabe criar senhas, mas aposto que cai em qualquer mensagem com prêmios!',
    wrong: 'Caiu direitinho no meu Phishing! Seus dados agora são meus! Regenerando sistemas!',
    guidance: 'Golpes de phishing usam pânico e urgência. Bancos sérios não pedem senhas ou dados por links suspeitos em SMS ou e-mail!',
    right: 'Não! Você desmascarou meu phishing! Meus servidores estão entrando em colapso!',
    praise: 'Sua atenção salvou os dados da Rede Kyber! Apenas mais um esforço, Guardiã!',
  },
];

export default class BossScene extends Phaser.Scene {
  constructor() {
    super('BossScene');
  }

  create() {
    this.playBackgroundMusic();
    createVolumeControl(this);
    this.projectileSound = this.sound.add('boss-projectile-fire', { volume: 0.3 });
    this.gameOverHitSound = this.sound.add('player-hit-gameover', { volume: 0.6 });
    this.characterId = this.registry.get('personagem') ?? 'leia';
    this.lives = this.registry.get('lives') ?? 3;
    this.turn = 1;
    this.bossHealth = 100;
    this.phase = 'intro';
    this.projectiles = [];
    this.invulnerableUntil = 0;
    this.attackSpeed = 1;
    this.hitsThisDodge = 0;
    this.actionButtons = [];
    this.answerButtons = [];
    this.createBossAnimations();

    this.add.image(WIDTH / 2, HEIGHT / 2, 'boss-battle-background')
      .setDisplaySize(WIDTH, HEIGHT);
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x090817, 0.38);
    this.add.image(WIDTH / 2, 38, 'boss-banner').setDisplaySize(384, 64);

    this.add.text(400, 82, 'AMEAÇA DO INVASOR', this.textStyle(8, '#ffffff'))
      .setOrigin(0.5);
    this.healthBar = this.add.graphics().setDepth(5);
    this.healthLabel = this.add.text(400, 103, '', this.textStyle(8, '#ff79ad'))
      .setOrigin(0.5);
    this.drawHealthBar();

    this.livesLabel = this.add.text(680, 32, 'VIDAS', this.textStyle(7, '#ffffff'))
      .setOrigin(1, 0.5);
    this.lifeHearts = [716, 741, 766].map((x) => this.add.image(x, 60, 'heart-full')
      .setDisplaySize(18, 18));
    this.updateLivesHud();

    this.bossSprite = this.add.sprite(666, 190, 'boss-trojan-speaking')
      .setDisplaySize(198, 198)
      .setDepth(4);
    this.bossSprite.play('boss-trojan-speaking-animation');
    this.arenaBox = this.add.nineslice(
      400,
      306,
      'boss-battle-box',
      undefined,
      ARENA.right - ARENA.left,
      ARENA.bottom - ARENA.top,
      8,
      8,
      8,
      8,
    ).setDepth(2);
    this.arenaFrame = this.add.rectangle(
      (ARENA.left + ARENA.right) / 2,
      (ARENA.top + ARENA.bottom) / 2,
      ARENA.right - ARENA.left,
      ARENA.bottom - ARENA.top,
    ).setStrokeStyle(1, 0x3fd0e0, 0.8).setFillStyle(0x080d21, 0.35).setDepth(1);
    this.arenaFrame.setVisible(false);
    this.soul = this.add.image(400, 306, 'boss-soul')
      .setDisplaySize(40, 40)
      .setDepth(10)
      .setVisible(false);

    this.dialogueBox = this.add.nineslice(
      WIDTH / 2,
      492,
      'intro-dialog-box',
      undefined,
      744,
      104,
      5,
      5,
      5,
      5,
    ).setDepth(20);
    this.message = this.add.text(48, 456, '', {
      ...this.textStyle(9, '#ffffff'),
      wordWrap: { width: 704 },
      lineSpacing: 7,
    }).setDepth(21);
    this.status = this.add.text(400, 431, '', this.textStyle(8, '#f5d56b'))
      .setOrigin(0.5).setDepth(21);
    this.timerLabel = this.add.text(400, 174, '', this.textStyle(9, '#f5d56b'))
      .setOrigin(0.5).setDepth(12);

    this.input.keyboard.on('keydown', this.handleKeyDown, this);
    this.input.on('pointerdown', this.handlePointerDown, this);
    this.input.on('pointermove', this.handlePointerMove, this);
    this.keys = this.input.keyboard.addKeys({
      up: 'UP',
      down: 'DOWN',
      left: 'LEFT',
      right: 'RIGHT',
      w: 'W',
      a: 'A',
      s: 'S',
      d: 'D',
    });

    this.setMessage(
      'TROJAN — Nossa, nossa... Temos uma heroína aqui! Achou mesmo que uns blocos de senha e alguns cliques iam me parar? Eu sou o Trojan e vou transformar a Rede Kyber no meu império de dados!',
    );
    this.actionButtons = [
      this.makeTextButton('COMEÇAR BATALHA', WIDTH / 2, 568, 220, 36, () => this.startTurn()),
    ];
  }

  playBackgroundMusic() {
    playBackgroundMusic(this, 'boss-chiptune');
  }

  textStyle(size, color) {
    return {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: `${size}px`,
      color,
      resolution: 2,
    };
  }

  setMessage(text) {
    this.message.setText(text);
  }

  createBossAnimations() {
    for (const animation of [
      { key: 'boss-trojan-idle-animation', texture: 'boss-trojan-idle', end: 5, frameRate: 7 },
      { key: 'boss-trojan-speaking-animation', texture: 'boss-trojan-speaking', end: 15, frameRate: 12 },
      { key: 'boss-trojan-jumping-animation', texture: 'boss-trojan-jumping', end: 17, frameRate: 14 },
    ]) {
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

  stopBossMotion() {
    this.bossTween?.remove();
    this.bossTween = null;
    this.bossAngerTween?.remove();
    this.bossAngerTween = null;
    if (this.bossSprite?.active) {
      this.bossSprite.setPosition(666, 190).setAngle(0).clearTint();
    }
  }

  playBossAnimation(key) {
    if (!this.bossSprite?.active) return;
    this.stopBossMotion();
    if (this.bossSprite.anims.currentAnim?.key !== key || !this.bossSprite.anims.isPlaying) {
      this.bossSprite.play(key);
    }
  }

  startBossJump() {
    this.playBossAnimation('boss-trojan-jumping-animation');
    this.bossTween = this.tweens.add({
      targets: this.bossSprite,
      y: 176,
      duration: 320,
      yoyo: true,
      repeat: -1,
    });
  }

  startBossAnger() {
    this.playBossAnimation('boss-trojan-speaking-animation');
    this.bossSprite.setTint(0xff535f);
    this.bossAngerTween = this.tweens.add({
      targets: this.bossSprite,
      x: 650,
      angle: -5,
      duration: 70,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        if (!this.bossSprite?.active) return;
        this.bossAngerTween = null;
        this.bossSprite.setPosition(666, 190).setAngle(0).clearTint();
      },
    });
  }

  drawHealthBar() {
    this.healthBar.clear();
    this.healthBar.fillStyle(0x241b33, 1).fillRect(286, 91, 228, 10);
    const color = this.bossHealth > 50 ? 0xff3fa4 : 0xff6b6b;
    if (this.bossHealth > 0) {
      this.healthBar.fillStyle(color, 1).fillRect(288, 93, 224 * this.bossHealth / 100, 6);
    }
    this.healthLabel.setText(`${this.bossHealth}%`);
  }

  updateLivesHud() {
    this.lifeHearts.forEach((heart, index) => {
      heart.setTexture(index < this.lives ? 'heart-full' : 'heart-empty');
    });
  }

  startTurn() {
    if (this.phase === 'gameover') return;
    this.clearButtons();
    this.phase = 'decision';
    this.playBossAnimation('boss-trojan-speaking-animation');
    this.status.setText(`TURNO ${this.turn} DE 3 — ESCOLHA SUA AÇÃO`);
    this.timerLabel.setText('');

    const prompts = [
      'TROJAN — Olha que oportunidade imperdível! “Parabéns, você ganhou um console de última geração grátis! Clique aqui para resgatar!” Vai dizer que não vai clicar?',
      'TROJAN — Sabe o que descobri nos seus arquivos? Sua senha ainda é “123456”! Hahaha, o que vai fazer agora?',
      'TROJAN — Notificação urgente: “SUPER PROMOÇÃO! Cupom de 90% OFF válido só pelos próximos 2 minutos! Compre antes que acabe!”',
    ];
    this.setMessage(prompts[this.turn - 1]);
    this.createActionButtons();
  }

  createActionButtons() {
    const positions = [166, 322, 478, 634];
    this.actionButtons = ACTIONS.map((action, index) => {
      const button = this.add.image(positions[index], 568, action.key, 0)
        .setInteractive({ useHandCursor: true })
        .setDepth(30);
      button.on('pointerover', () => button.setFrame(1));
      button.on('pointerout', () => button.setFrame(0));
      button.on('pointerdown', () => {
        this.sound.play('ui-click', { volume: 0.35 });
        this.chooseAction(action.id);
      });
      return button;
    });
  }

  chooseAction(action) {
    if (this.phase !== 'decision') return;
    if (this.turn === 2 && action === 'item') {
      this.phase = 'item';
      this.clearButtons();
      this.setMessage('Inventário: use a Autenticação em Dois Fatores para bloquear a tentativa de invasão.');
      const button = this.makeTextButton('USAR TOKEN 2FA', 400, 568, 238, 42, () => {
        this.resolveAction('2fa');
      });
      this.tokenIcon = this.add.image(298, 568, 'boss-token-2fa')
        .setDisplaySize(26, 26)
        .setDepth(32);
      this.actionButtons = [button];
      return;
    }
    this.resolveAction(action);
  }

  resolveAction(action) {
    if (!['decision', 'item'].includes(this.phase)) return;
    const expected = ['denunciar', '2fa', 'analisar'][this.turn - 1];
    const correct = action === expected;
    this.phase = 'resolving';
    this.clearButtons();
    if (correct) this.startBossJump();
    else this.startBossAnger();

    if (correct) {
      this.bossHealth = [66, 33, 0][this.turn - 1];
      this.drawHealthBar();
      const feedback = [
        'DENÚNCIA CONFIRMADA! A ameaça do Trojan diminuiu.',
        '2FA ATIVADA! A tentativa de invasão foi bloqueada.',
        'GOLPE DESMASCARADO! A ameaça do Trojan foi neutralizada.',
      ];
      this.setMessage(feedback[this.turn - 1]);
    } else {
      this.attackSpeed = Math.min(2.2, this.attackSpeed + 0.35);
      this.setMessage('Ação incorreta! O próximo ataque ficará mais rápido. Prepare-se para desviar!');
    }

    this.time.delayedCall(900, () => this.startDodge());
  }

  startDodge() {
    if (this.phase === 'gameover') return;
    this.phase = 'dodge';
    this.dodgeRemaining = 5;
    this.hitsThisDodge = 0;
    this.soul.setPosition(400, 306).setVisible(true);
    this.arenaFrame.setVisible(true);
    this.startBossJump();
    this.status.setText(`DESVIE DOS PROJÉTEIS! MOVA-SE COM AS SETAS, WASD OU TOQUE`);
    this.setMessage([
      'CHUVA DE SPAM — Envelopes com alerta estão caindo! Desvie com o cadeado escudo.',
      'ATAQUE DE FORÇA BRUTA — Sequências de números e caracteres cruzam a caixa em rajadas!',
      'ENXURRADA DE POP-UPS — Links e ofertas falsas avançam das bordas para o centro!',
    ][this.turn - 1]);
    this.timerLabel.setText('5');
    this.projectileTimer?.remove();
    const baseDelay = [520, 330, 410][this.turn - 1];
    this.projectileTimer = this.time.addEvent({
      delay: Math.max(150, baseDelay / this.attackSpeed),
      loop: true,
      callback: () => this.spawnProjectile(),
    });
  }

  spawnProjectile() {
    if (this.phase !== 'dodge') return;
    let texture;
    let frame = 0;
    let x;
    let y;
    let velocityX = 0;
    let velocityY = 0;

    if (this.turn === 1) {
      texture = 'boss-projectile-spam';
      frame = Phaser.Math.Between(0, 1);
      x = Phaser.Math.Between(ARENA.left + 12, ARENA.right - 12);
      y = ARENA.top - 12;
      velocityY = 132 * this.attackSpeed;
    } else if (this.turn === 2) {
      texture = 'boss-projectile-bruteforce';
      frame = Phaser.Math.Between(0, 17);
      const fromLeft = Math.random() < 0.5;
      x = fromLeft ? ARENA.left - 10 : ARENA.right + 10;
      y = Phaser.Math.Between(ARENA.top + 14, ARENA.bottom - 14);
      velocityX = (fromLeft ? 1 : -1) * Phaser.Math.Between(190, 250) * this.attackSpeed;
    } else {
      texture = 'boss-projectile-popup';
      frame = Phaser.Math.Between(0, 2);
      const edge = Phaser.Math.Between(0, 3);
      if (edge < 2) {
        x = edge === 0 ? ARENA.left - 15 : ARENA.right + 15;
        y = Phaser.Math.Between(ARENA.top + 12, ARENA.bottom - 12);
      } else {
        x = Phaser.Math.Between(ARENA.left + 12, ARENA.right - 12);
        y = edge === 2 ? ARENA.top - 15 : ARENA.bottom + 15;
      }
      const angle = Phaser.Math.Angle.Between(x, y, 400, 306);
      const speed = Phaser.Math.Between(125, 180) * this.attackSpeed;
      velocityX = Math.cos(angle) * speed;
      velocityY = Math.sin(angle) * speed;
    }

    this.projectileSound.play();
    const projectile = this.add.image(x, y, texture, frame).setDepth(8);
    projectile.setData('velocityX', velocityX);
    projectile.setData('velocityY', velocityY);
    this.projectiles.push(projectile);
  }

  finishDodge() {
    if (this.phase !== 'dodge') return;
    this.phase = 'transition';
    this.projectileTimer?.remove();
    this.projectileTimer = null;
    this.clearProjectiles();
    this.soul.setVisible(false);
    this.arenaFrame.setVisible(false);
    this.stopBossMotion();
    this.bossSprite.play('boss-trojan-idle-animation');
    this.attackSpeed = Math.max(1, this.attackSpeed - 0.2);

    if (this.turn < 3) {
      this.showQuiz(this.turn - 1);
      return;
    }
    this.finishVictory();
  }

  showQuiz(index) {
    this.playBackgroundMusic();
    const quiz = QUIZZES[index];
    this.phase = 'quiz';
    this.dialogueBox.setVisible(false);
    this.message.setVisible(false);
    this.arenaBox.setVisible(false);
    this.status.setPosition(400, 136).setOrigin(0.5, 0);
    this.status.setStyle({
      ...this.textStyle(8, '#f5d56b'),
      align: 'center',
      wordWrap: { width: 720 },
    });
    this.status.setText(`TROJAN — ${quiz.intro}`);
    this.timerLabel.setText('');
    this.playBossAnimation('boss-trojan-speaking-animation');
    this.bossSprite.setVisible(false);
    this.questionText?.destroy();
    this.questionText = this.add.text(40, 196, quiz.question, {
      ...this.textStyle(9, '#ffffff'),
      wordWrap: { width: 720 },
      lineSpacing: 5,
    }).setDepth(24);
    this.clearButtons();

    const positions = [
      [220, 327],
      [580, 327],
      [220, 419],
      [580, 419],
    ];
    const letters = ['A', 'B', 'C', 'D'];
    this.answerButtons = quiz.answers.map((answer, answerIndex) => {
      const [x, y] = positions[answerIndex];
      const panel = this.add.nineslice(
        x,
        y,
        'boss-battle-box',
        undefined,
        344,
        80,
        8,
        8,
        8,
        8,
      ).setInteractive({ useHandCursor: true }).setDepth(25);
      const label = this.add.text(x - 160, y, `${letters[answerIndex]}) ${answer}`, {
        ...this.textStyle(7, '#ffffff'),
        wordWrap: { width: 310 },
        lineSpacing: 2,
      }).setOrigin(0, 0.5).setDepth(26);
      panel.on('pointerover', () => panel.setTint(0x8fdce8));
      panel.on('pointerout', () => panel.clearTint());
      panel.on('pointerdown', () => {
        this.sound.play('ui-click', { volume: 0.35 });
        this.answerQuiz(answerIndex);
      });
      return { panel, label };
    });
  }

  answerQuiz(answerIndex) {
    if (this.phase !== 'quiz') return;
    const quizIndex = this.turn - 1;
    const quiz = QUIZZES[quizIndex];
    this.clearButtons();
    this.questionText?.destroy();
    this.questionText = null;
    this.restoreDialogueLayout();

    if (answerIndex === quiz.correct) {
      this.bossHealth = [66, 33][quizIndex];
      this.drawHealthBar();
      this.phase = 'transition';
      this.playBossAnimation('boss-trojan-speaking-animation');
      this.setMessage(`TROJAN — ${quiz.right}\nHERA — ${quiz.praise}`);
      this.time.delayedCall(3200, () => {
        this.turn += 1;
        this.startTurn();
      });
      return;
    }

    this.bossHealth = quiz.healthOnMiss;
    this.drawHealthBar();
    this.phase = 'quiz-feedback';
    this.startBossAnger();
    this.setMessage(`TROJAN — ${quiz.wrong}\nHERA — ${quiz.guidance}`);
    this.time.delayedCall(4500, () => this.showQuiz(quizIndex));
  }

  finishVictory() {
    this.phase = 'victory';
    this.status.setText('SISTEMAS DO TROJAN EM COLAPSO');
    this.timerLabel.setText('');
    this.playBossAnimation('boss-trojan-speaking-animation');
    this.tweens.add({
      targets: this.bossSprite,
      alpha: 0.15,
      duration: 120,
      yoyo: true,
      repeat: 7,
    });
    const explosion = this.add.sprite(666, 190, 'boss-explosion', 0).setDepth(15);
    if (!this.anims.exists('boss-explosion-animation')) {
      this.anims.create({
        key: 'boss-explosion-animation',
        frames: this.anims.generateFrameNumbers('boss-explosion', { start: 0, end: 4 }),
        frameRate: 9,
      });
    }
    explosion.play('boss-explosion-animation');
    this.setMessage('TROJAN — Nããão! Minhas conexões estão caindo... Meus spams foram bloqueados! Guardiã Firewall... isso não vai ficar assim!');
    this.time.delayedCall(2400, () => {
      this.scene.start('VictoryScene', { personagem: this.characterId });
    });
  }

  makeTextButton(label, x, y, width, height, onClick) {
    const panel = this.add.nineslice(
      x,
      y,
      'boss-battle-box',
      undefined,
      width,
      height,
      8,
      8,
      8,
      8,
    ).setInteractive({ useHandCursor: true }).setDepth(30);
    const text = this.add.text(x, y, label, this.textStyle(8, '#ffffff'))
      .setOrigin(0.5).setDepth(31);
    panel.on('pointerover', () => {
      panel.setTint(0x8fdce8);
      text.setColor('#3fd0e0');
    });
    panel.on('pointerout', () => {
      panel.clearTint();
      text.setColor('#ffffff');
    });
    panel.on('pointerdown', onClick);
    return { panel, text };
  }

  clearButtons() {
    for (const button of this.actionButtons) {
      if (button.panel) {
        button.panel.destroy();
        button.text.destroy();
      } else {
        button.destroy();
      }
    }
    for (const button of this.answerButtons) {
      button.panel.destroy();
      button.label.destroy();
    }
    this.actionButtons = [];
    this.answerButtons = [];
    this.tokenIcon?.destroy();
    this.tokenIcon = null;
  }

  restoreDialogueLayout() {
    this.dialogueBox.setVisible(true);
    this.message.setVisible(true);
    this.arenaBox.setVisible(true);
    this.status.setPosition(400, 431).setOrigin(0.5);
    this.status.setStyle(this.textStyle(8, '#f5d56b'));
    this.bossSprite.setVisible(true);
  }

  handleKeyDown(event) {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (this.phase === 'intro' && ['enter', ' ', 'e'].includes(key)) {
      this.startTurn();
      return;
    }
    if (this.phase === 'decision') {
      const action = ACTIONS.find((candidate) => candidate.hotkey === key);
      if (action) this.chooseAction(action.id);
      return;
    }
    if (this.phase === 'quiz') {
      const answer = ['a', 'b', 'c', 'd'].indexOf(key);
      const number = Number(key) - 1;
      if (answer !== -1) this.answerQuiz(answer);
      else if (number >= 0 && number < 4) this.answerQuiz(number);
    }
  }

  handlePointerDown(pointer) {
    if (this.phase === 'dodge' && this.isInsideArena(pointer.x, pointer.y)) {
      this.moveSoulTo(pointer.x, pointer.y);
    }
  }

  handlePointerMove(pointer) {
    if (this.phase === 'dodge' && pointer.isDown && this.isInsideArena(pointer.x, pointer.y)) {
      this.moveSoulTo(pointer.x, pointer.y);
    }
  }

  isInsideArena(x, y) {
    return x >= ARENA.left && x <= ARENA.right && y >= ARENA.top && y <= ARENA.bottom;
  }

  moveSoulTo(x, y) {
    this.soul.setPosition(
      Phaser.Math.Clamp(x, ARENA.left + 18, ARENA.right - 18),
      Phaser.Math.Clamp(y, ARENA.top + 18, ARENA.bottom - 18),
    );
  }

  clearProjectiles() {
    for (const projectile of this.projectiles) projectile.destroy();
    this.projectiles = [];
  }

  takeHit(time) {
    if (time < this.invulnerableUntil || this.phase !== 'dodge') return;
    this.invulnerableUntil = time + 900;
    this.lives = Math.max(0, this.lives - 1);
    this.registry.set('lives', this.lives);
    this.updateLivesHud();
    this.hitsThisDodge += 1;
    this.cameras.main.shake(120, 0.006);
    if (this.lives === 0) {
      this.phase = 'gameover';
      this.projectileTimer?.remove();
      this.clearProjectiles();
      this.gameOverHitSound.play();
      this.setMessage('O Trojan atingiu o núcleo da rede! Todas as vidas foram perdidas.');
      this.time.delayedCall(1300, () => this.scene.start('GameOverScene'));
    }
  }

  update(_time, delta) {
    if (this.phase !== 'dodge') return;

    const movement = 210 * delta / 1000;
    const moveLeft = this.keys.left.isDown || this.keys.a.isDown;
    const moveRight = this.keys.right.isDown || this.keys.d.isDown;
    const moveUp = this.keys.up.isDown || this.keys.w.isDown;
    const moveDown = this.keys.down.isDown || this.keys.s.isDown;
    let x = this.soul.x + (Number(moveRight) - Number(moveLeft)) * movement;
    let y = this.soul.y + (Number(moveDown) - Number(moveUp)) * movement;
    this.moveSoulTo(x, y);

    this.dodgeRemaining -= delta / 1000;
    this.timerLabel.setText(`${Math.max(0, Math.ceil(this.dodgeRemaining))}`);
    const now = this.time.now;
    this.soul.setAlpha(now < this.invulnerableUntil && Math.floor(now / 90) % 2 === 0 ? 0.3 : 1);

    this.projectiles = this.projectiles.filter((projectile) => {
      if (!projectile.active) return false;
      projectile.x += projectile.getData('velocityX') * delta / 1000;
      projectile.y += projectile.getData('velocityY') * delta / 1000;
      const collides = Phaser.Math.Distance.Between(
        projectile.x,
        projectile.y,
        this.soul.x,
        this.soul.y,
      ) < (projectile.width + 20) / 2;
      if (collides) {
        this.takeHit(now);
        projectile.destroy();
        return false;
      }
      const outside = projectile.x < ARENA.left - 45
        || projectile.x > ARENA.right + 45
        || projectile.y < ARENA.top - 45
        || projectile.y > ARENA.bottom + 45;
      if (outside) {
        projectile.destroy();
        return false;
      }
      return true;
    });

    if (this.dodgeRemaining <= 0 && this.phase === 'dodge') this.finishDodge();
  }
}