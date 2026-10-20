import Phaser from 'phaser';
import { CHARACTERS } from '../config/menuData.js';
import { PHASE_BANNERS } from '../config/phaseData.js';
import KyberMap from '../objects/kybermap.js';
import EmailChallenge from '../objects/emailchallenge.js';
import PasswordChallenge from '../objects/passwordchallenge.js';
import PermissionsChallenge from '../objects/permissionschallenge.js';
import Player, { MAP_CHARACTER_SIZE } from '../objects/player.js';

const MAP_ASSET_PATH = `${import.meta.env.BASE_URL}assets/mapa/`;
const PHASE_ONE_INTRO = 'O setor de autenticação da Rede Kyber está sendo bombardeado por ataques de força bruta! Precisamos reforçar as credenciais de acesso imediatamente. Combine os blocos de caracteres e crie uma senha complexa antes que o tempo se esgote. Lembre-se: senhas longas com letras, números e símbolos transformam tentativas de invasão que levariam segundos em cálculos de milhares de anos!';
const DIALOGUE_LINE_LENGTH = 44;
const DIALOGUE_LINES_PER_PAGE = 5;

export default class MapScene extends Phaser.Scene {
  constructor() {
    super('MapScene');
  }

  preload() {
    KyberMap.preload(this, MAP_ASSET_PATH);
  }

  create(data) {
    this.character = CHARACTERS.find(({ id }) => id === data.personagem)
      ?? CHARACTERS.find(({ id }) => id === this.registry.get('personagem'))
      ?? CHARACTERS[0];
    this.mapId = data.mapId ?? PHASE_BANNERS[1].mapId;
    this.dialogueOpen = false;
    this.challenge = null;
    this.phaseComplete = false;
    this.awaitingBoss = false;
    this.gameOverScheduled = false;

    this.createAnimations();
    this.createMap();
    this.createPlayer();
    this.createInteractionHint();
    this.createUiCamera();
    this.createDialogueUI();
    this.createPlayerHud();
    this.input.keyboard.on('keydown', this.handleKeyDown, this);
    this.input.on('pointerdown', this.handlePointerDown, this);
  }

  createAnimations() {
    for (const sprite of this.character.mapSprites) {
      if (this.anims.exists(sprite.key)) continue;

      this.anims.create({
        key: sprite.key,
        frames: this.anims.generateFrameNumbers(sprite.key, {
          start: 0,
          end: sprite.frameCount - 1,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    const heraAnimations = [
      { key: 'hera-map-idle', texture: 'hera-idle', frames: 8, frameRate: 8 },
      { key: 'hera-map-speaking', texture: 'hera-speaking', frames: 7, frameRate: 6 },
    ];
    for (const animation of heraAnimations) {
      if (this.anims.exists(animation.key)) continue;

      this.anims.create({
        key: animation.key,
        frames: this.anims.generateFrameNumbers(animation.texture, {
          start: 0,
          end: animation.frames - 1,
        }),
        frameRate: animation.frameRate,
        repeat: -1,
      });
    }
  }

  createMap() {
    this.kmap = new KyberMap(this, this.mapId, {
      animations: true,
      lights: true,
      showNpcs: true,
      npcFactory: (_scene, npc) => {
        if (npc.id !== 'npc1') return null;

        return this.add.sprite(npc.x, npc.y, 'hera-idle')
          .setOrigin(0.5, 1)
          .setDisplaySize(MAP_CHARACTER_SIZE, MAP_CHARACTER_SIZE)
          .play('hera-map-idle');
      },
    });

    const { width, height } = this.kmap.data;
    this.mapZoom = Math.min(this.scale.width / width, this.scale.height / height);
    this.cameras.main.setBackgroundColor(0x0d0b14);
    this.cameras.main.setZoom(this.mapZoom);
    this.cameras.main.centerOn(width / 2, height / 2);
  }

  createPlayer() {
    const spawn = this.kmap.getSpawn();
    this.player = new Player(this, this.character, spawn, this.kmap);
  }

  createInteractionHint() {
    this.interactionHint = this.add.text(0, 0, 'E - FALAR COM HERA', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '5px',
      color: '#ffffff',
      backgroundColor: '#100c1a',
      padding: { x: 4, y: 3 },
      resolution: 2,
    }).setOrigin(0.5, 1).setDepth(20000).setVisible(false);
  }

  createDialogueUI() {
    const dialogueCenterY = this.scale.height - 100;
    this.dialogueLayer = this.add.container(0, 0)
      .setScrollFactor(0)
      .setDepth(30000)
      .setVisible(false);
    this.cameras.main.ignore(this.dialogueLayer);

    this.dialogueLayer.add(this.add.nineslice(
      84,
      dialogueCenterY,
      'intro-portrait-frame',
      undefined,
      128,
      128,
      5,
      5,
      5,
      5,
    ));
    this.dialoguePortrait = this.add.sprite(84, dialogueCenterY + 8, 'hera-idle')
      .setOrigin(0.5)
      .setCrop(0, 0, 32, 20)
      .setDisplaySize(78, 68)
      .play('hera-map-idle');
    this.dialogueLayer.add(this.dialoguePortrait);

    this.dialogueLayer.add(this.add.nineslice(
      466,
      dialogueCenterY,
      'intro-dialog-box',
      undefined,
      620,
      176,
      5,
      5,
      5,
      5,
    ));
    this.dialogueLayer.add(this.add.nineslice(
      184,
      dialogueCenterY - 88,
      'intro-name-tag',
      undefined,
      136,
      36,
      3,
      3,
      3,
      3,
    ));
    this.dialogueSpeaker = this.add.text(184, dialogueCenterY - 88, 'HERA', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffffff',
      resolution: 2,
    }).setOrigin(0.5);
    this.dialogueLayer.add(this.dialogueSpeaker);
    this.dialogueText = this.add.text(174, dialogueCenterY - 60, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff',
      resolution: 2,
      lineSpacing: 5,
      wordWrap: { width: 570 },
    });
    this.dialogueLayer.add(this.dialogueText);
    this.dialoguePrompt = this.add.text(750, dialogueCenterY + 65, 'E / CLIQUE PARA AVANÇAR', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#b6a9cf',
      resolution: 2,
    }).setOrigin(1, 0);
    this.dialogueLayer.add(this.dialoguePrompt);
    this.bossPrompt = this.add.text(400, 550, 'PRESSIONE * OU TOQUE PARA ENFRENTAR O INVASOR', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#f5d56b',
      resolution: 2,
      backgroundColor: '#100c1a',
      padding: { x: 8, y: 6 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(30020).setVisible(false);
    this.cameras.main.ignore(this.bossPrompt);
  }

  createUiCamera() {
    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.uiCamera.setZoom(1).setScroll(0, 0);
    this.uiCamera.ignore(this.children.list);
  }

  createPlayerHud() {
    this.playerHud = this.add.container(0, 0)
      .setScrollFactor(0)
      .setDepth(30010);
    this.cameras.main.ignore(this.playerHud);

    this.playerHud.add(this.add.rectangle(74, 36, 142, 56, 0x100c1a, 0.95)
      .setStrokeStyle(2, 0x3fd0e0));

    this.playerHud.add(this.add.text(74, 19, 'VIDAS', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#ffffff',
      resolution: 2,
    }).setOrigin(0.5));

    this.lifeHearts = [46, 74, 102].map((x) => {
      const heart = this.add.image(x, 43, 'heart-full').setDisplaySize(22, 22);
      this.playerHud.add(heart);
      return heart;
    });
    this.updatePlayerHud(this.registry.get('lives') ?? 3);
  }

  updatePlayerHud(lives) {
    this.lifeHearts.forEach((heart, index) => {
      heart.setTexture(index < lives ? 'heart-full' : 'heart-empty');
    });
  }

  loseLife() {
    const currentLives = this.registry.get('lives') ?? 3;
    if (currentLives === 0) return 0;

    const lives = currentLives - 1;
    this.registry.set('lives', lives);
    this.updatePlayerHud(lives);
    if (lives === 0 && !this.gameOverScheduled) {
      this.gameOverScheduled = true;
      this.defeatOverlay = this.add.container(0, 0)
        .setScrollFactor(0)
        .setDepth(40000);
      this.cameras.main.ignore(this.defeatOverlay);
      this.defeatOverlay.add(this.add.rectangle(
        this.scale.width / 2,
        this.scale.height / 2,
        this.scale.width,
        this.scale.height,
        0x000000,
        0.72,
      ));
      this.defeatOverlay.add(this.add.image(
        this.scale.width / 2,
        this.scale.height / 2,
        'defeat-banner',
      ).setDisplaySize(504, 120));
      this.challenge?.lockForGameOver();
      this.input.enabled = false;
      this.time.delayedCall(2000, () => {
        this.scene.start('GameOverScene');
      });
    }
    return lives;
  }

  startNpcDialogue() {
    if (this.dialogueOpen || this.challenge || this.awaitingBoss) return;
    this.dialogueOpen = true;
    this.hera = this.kmap.npcs.npc1?.go;
    this.hera?.play('hera-map-speaking');
    this.dialogueSpeaker.setText('HERA');
    const intro = this.mapId === PHASE_BANNERS[1].mapId
      ? PHASE_ONE_INTRO
      : this.kmap.dialogues.intro?.[0]?.text;
    if (!intro) throw new Error(`Missing intro dialogue for map "${this.mapId}"`);
    this.showDialogue(intro, () => this.startMapChallenge());
  }

  showDialogue(text, onComplete) {
    this.dialogueOpen = true;
    this.dialoguePages = this.paginateDialogue(text);
    this.dialoguePageIndex = 0;
    this.dialoguePrompt.setText('E / CLIQUE PARA AVANÇAR');
    this.dialogueLayer.setVisible(true);
    this.dialoguePortrait.play('hera-map-speaking');
    this.dialogueComplete = onComplete;
    this.startDialoguePage();
  }

  paginateDialogue(text) {
    const lines = [];
    let line = '';

    for (const word of text.trim().split(/\s+/)) {
      const nextLine = line ? `${line} ${word}` : word;
      if (nextLine.length > DIALOGUE_LINE_LENGTH && line) {
        lines.push(line);
        line = word;
      } else {
        line = nextLine;
      }
    }
    if (line) lines.push(line);

    const pages = [];
    for (let index = 0; index < lines.length; index += DIALOGUE_LINES_PER_PAGE) {
      pages.push(lines.slice(index, index + DIALOGUE_LINES_PER_PAGE).join('\n'));
    }
    return pages;
  }

  startDialoguePage() {
    this.dialogueTextValue = this.dialoguePages[this.dialoguePageIndex];
    const text = this.dialogueTextValue;
    this.dialogueText.setText(text.slice(0, 1));
    this.dialogueTyping = true;
    this.dialogueIndex = 1;
    this.dialogueTimer = this.time.addEvent({
      delay: 24,
      repeat: text.length - this.dialogueIndex - 1,
      callback: () => {
        this.dialogueIndex += 1;
        this.dialogueText.setText(text.slice(0, this.dialogueIndex));
        if (this.dialogueIndex >= text.length) {
          this.dialogueTimer.remove();
          this.dialogueTimer = null;
          this.dialogueTyping = false;
          this.dialoguePortrait.play('hera-map-idle');
          this.hera?.play('hera-map-idle');
        }
      },
    });
  }

  advanceDialogue() {
    if (!this.dialogueOpen || this.challenge) return;

    if (this.dialogueTyping) {
      this.dialogueTimer?.remove();
      this.dialogueTimer = null;
      this.dialogueText.setText(this.dialogueTextValue);
      this.dialogueTyping = false;
      this.dialoguePortrait.play('hera-map-idle');
      this.hera?.play('hera-map-idle');
      return;
    }

    if (this.dialoguePageIndex < this.dialoguePages.length - 1) {
      this.dialoguePageIndex += 1;
      this.dialoguePortrait.play('hera-map-speaking');
      this.hera?.play('hera-map-speaking');
      this.startDialoguePage();
      return;
    }

    const onComplete = this.dialogueComplete;
    this.dialogueComplete = null;
    this.dialogueOpen = false;
    this.dialogueLayer.setVisible(false);
    onComplete?.();
  }

  startPasswordChallenge() {
    this.challenge = new PasswordChallenge(this, {
      onComplete: () => this.completePasswordChallenge(),
      onLifeLost: () => this.loseLife(),
    });
  }

  startMapChallenge() {
    if (this.mapId === PHASE_BANNERS[1].mapId) {
      this.startPasswordChallenge();
      return;
    }

    const challenge = this.kmap.interactables[0]?.challenge;
    if (challenge === 'fase2_golpe') {
      this.challenge = new EmailChallenge(
        this,
        () => this.completeMapChallenge(),
        () => this.loseLife(),
      );
    } else if (challenge === 'fase3_permissoes') {
      this.challenge = new PermissionsChallenge(
        this,
        () => this.completeMapChallenge(),
        () => this.loseLife(),
      );
    } else {
      throw new Error(`No challenge configured for map "${this.mapId}"`);
    }
  }

  completeMapChallenge() {
    const challenge = this.kmap.interactables[0]?.challenge;
    this.challenge = null;
    if (!challenge) throw new Error(`Map "${this.mapId}" has no challenge to complete`);
    this.kmap.complete(challenge);

    const conclusion = this.kmap.dialogues.fim?.[0]?.text;
    if (!conclusion) throw new Error(`Missing conclusion dialogue for map "${this.mapId}"`);
    this.showDialogue(conclusion, () => {
      if (this.mapId === PHASE_BANNERS[2].mapId) {
        this.scene.start('PhaseBannerScene', {
          phase: 3,
          personagem: this.character.id,
        });
        return;
      }

      if (this.mapId === PHASE_BANNERS[3].mapId) {
        this.awaitingBoss = true;
        this.bossPrompt.setVisible(true);
      }
    });
  }

  completePasswordChallenge() {
    this.challenge.destroy();
    this.challenge = null;
    this.kmap.complete('fase1_senha');
    this.phaseComplete = true;

    const guardian = this.character.id === 'leia' ? 'Guardiã' : 'Guardião';
    this.showDialogue(
      `Excelente trabalho, ${guardian}! O firewall de autenticação da Rede Kyber está restaurado e inatacável. Prepare-se, o próximo setor precisa da sua ajuda.`,
      () => this.scene.start('PhaseBannerScene', {
        phase: 2,
        personagem: this.character.id,
      }),
    );
  }

  handleKeyDown(event) {
    if (event.repeat) return;
    if (this.awaitingBoss) {
      if (event.key === '*' || event.code === 'NumpadMultiply'
        || (event.code === 'Digit8' && event.shiftKey)) {
        this.startBossBattle();
      }
      return;
    }
    if (this.challenge) return;
    const key = event.key.toLowerCase();
    if (key === 'e' || key === 'enter' || key === ' ') {
      if (this.dialogueOpen) {
        this.advanceDialogue();
      } else if (this.kmap.npcNear(this.player.sprite.x, this.player.sprite.y, 42)) {
        this.startNpcDialogue();
      } else if (this.kmap.interactableAt(this.player.sprite.x, this.player.sprite.y)) {
        this.startMapChallenge();
      }
    }
  }

  handlePointerDown() {
    if (this.challenge) return;
    if (this.awaitingBoss) {
      this.startBossBattle();
      return;
    }
    if (this.dialogueOpen) {
      this.advanceDialogue();
    } else if (this.kmap.npcNear(this.player.sprite.x, this.player.sprite.y, 42)) {
      this.startNpcDialogue();
    } else if (this.kmap.interactableAt(this.player.sprite.x, this.player.sprite.y)) {
      this.startMapChallenge();
    }
  }

  startBossBattle() {
    this.scene.start('BossScene', { personagem: this.character.id });
  }

  update(time) {
    this.kmap.update(time);
    this.player.update(!this.dialogueOpen && !this.challenge && !this.awaitingBoss);

    const npc = this.kmap.npcs.npc1?.data;
    if (!npc || this.dialogueOpen || this.challenge || this.awaitingBoss) {
      this.interactionHint.setVisible(false);
      return;
    }

    const { x, y } = this.player.sprite;
    const nearNpc = this.kmap.npcNear(x, y, 42);
    const interactable = this.kmap.interactableAt(x, y);
    if (nearNpc) {
      this.interactionHint
        .setText('E - FALAR COM HERA')
        .setPosition(nearNpc.x, nearNpc.y - 40)
        .setVisible(true);
    } else if (interactable) {
      this.interactionHint
        .setText('E - INICIAR DESAFIO')
        .setPosition(x, y - 28)
        .setVisible(true);
    } else {
      this.interactionHint.setVisible(false);
    }
  }
}
