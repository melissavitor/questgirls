import Phaser from 'phaser';
import { CHARACTERS, MENU_ASSETS } from '../config/menuData.js';
import {
  EMAIL_ASSETS,
  PASSWORD_ASSETS,
  PERMISSION_ASSETS,
  PHASE_BANNERS,
} from '../config/phaseData.js';

const COLORS = {
  background: 0x0d0b14,
  accent: 0x3fd0e0,
  text: '#ffffff',
  track: 0x241b33,
};

const LOADING_DURATION = 3000;
const INTRO_ASSETS = [
  {
    key: 'hera-idle',
    path: 'assets/images/sprites/Sprites-Hera/Hera-parada-sheet.png',
    frameWidth: 32,
    frameHeight: 32,
  },
  {
    key: 'hera-speaking',
    path: 'assets/images/sprites/Sprites-Hera/Hera-falando-sheet.png',
    frameWidth: 32,
    frameHeight: 32,
  },
];

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const { width, height } = this.scale;
    const barWidth = 400;
    const barHeight = 18;
    const barX = (width - barWidth) / 2;
    const barY = height / 2 + 125;
    this.progressBarBounds = { barX, barY, barWidth, barHeight };

    this.cameras.main.setBackgroundColor(COLORS.background);

    const grid = this.add.graphics().lineStyle(1, COLORS.accent, 0.12);
    for (let x = 0; x < width; x += 32) {
      grid.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 32) {
      grid.lineBetween(0, y, width, y);
    }

    this.loadingLabel = this.add.text(width / 2, barY - 26, 'CARREGANDO...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: COLORS.text,
    }).setOrigin(0.5);

    const track = this.add.graphics();
    track.fillStyle(COLORS.track, 1).fillRect(barX, barY, barWidth, barHeight);
    track.lineStyle(2, COLORS.accent, 1).strokeRect(barX, barY, barWidth, barHeight);

    this.loadingBar = this.add.graphics();
    this.loadingProgress = this.add.text(width / 2, barY + barHeight + 14, '0%', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: COLORS.text,
    }).setOrigin(0.5);

    this.load.on('progress', (progress) => {
      this.drawProgress(progress);
    });

    const menuPath = 'assets/images/ui/menu/';
    this.load.image(
      MENU_ASSETS.logo,
      `${import.meta.env.BASE_URL}${menuPath}logo_guardiao_do_firewall_300x118.png`,
    );

    for (const [key, file] of [
      [MENU_ASSETS.playButton, 'btn_jogar_96x32_4f.png'],
      [MENU_ASSETS.creditsButton, 'btn_creditos_96x32_4f.png'],
      [MENU_ASSETS.continueButton, 'btn_continuar_96x32_4f.png'],
      [MENU_ASSETS.backButton, 'btn_voltar_96x32_4f.png'],
    ]) {
      this.load.spritesheet(key, `${import.meta.env.BASE_URL}${menuPath}${file}`, {
        frameWidth: 96,
        frameHeight: 32,
      });
    }

    for (const character of CHARACTERS) {
      this.load.spritesheet(
        character.image,
        `${import.meta.env.BASE_URL}${character.spriteSheetPath}`,
        { frameWidth: 256, frameHeight: 256 },
      );
    }

    for (const asset of INTRO_ASSETS) {
      this.load.spritesheet(
        asset.key,
        `${import.meta.env.BASE_URL}${asset.path}`,
        { frameWidth: asset.frameWidth, frameHeight: asset.frameHeight },
      );
    }

    for (const character of CHARACTERS) {
      for (const sprite of character.mapSprites) {
        this.load.spritesheet(
          sprite.key,
          `${import.meta.env.BASE_URL}${sprite.path}`,
          { frameWidth: 256, frameHeight: 256 },
        );
      }
    }

    const passwordPath = 'assets/images/ui/04_fase1_senha/';
    for (const asset of PASSWORD_ASSETS) {
      const url = `${import.meta.env.BASE_URL}${passwordPath}${asset.file}`;
      if (asset.frameWidth) {
        this.load.spritesheet(asset.key, url, {
          frameWidth: asset.frameWidth,
          frameHeight: asset.frameHeight,
        });
      } else {
        this.load.image(asset.key, url);
      }
    }

    for (const [assets, folder] of [
      [EMAIL_ASSETS, '05_fase2_golpe/'],
      [PERMISSION_ASSETS, '06_fase3_dados/'],
    ]) {
      for (const asset of assets) {
        const url = `${import.meta.env.BASE_URL}assets/images/ui/${folder}${asset.file}`;
        if (asset.frameWidth) {
          this.load.spritesheet(asset.key, url, {
            frameWidth: asset.frameWidth,
            frameHeight: asset.frameHeight,
          });
        } else {
          this.load.image(asset.key, url);
        }
      }
    }

    const bannerPath = 'assets/images/ui/09_titulo/';
    for (const banner of Object.values(PHASE_BANNERS)) {
      this.load.image(
        banner.key,
        `${import.meta.env.BASE_URL}${bannerPath}${banner.file}`,
      );
    }
    this.load.image(
      'defeat-banner',
      `${import.meta.env.BASE_URL}${bannerPath}banner_derrota_168x40.png`,
    );

    this.load.image(
      'intro-dialog-box',
      `${import.meta.env.BASE_URL}assets/images/ui/01_ui/caixas/dialogo_caixa_9slice_24x24.png`,
    );
    this.load.image(
      'intro-name-tag',
      `${import.meta.env.BASE_URL}assets/images/ui/01_ui/caixas/nome_etiqueta_9slice_16x16.png`,
    );
    this.load.image(
      'intro-portrait-frame',
      `${import.meta.env.BASE_URL}assets/images/ui/01_ui/caixas/retrato_moldura_9slice_24x24.png`,
    );
    this.load.image(
      'heart-full',
      `${import.meta.env.BASE_URL}assets/images/ui/01_ui/icones/heart_cheio_16x16.png`,
    );
    this.load.image(
      'heart-empty',
      `${import.meta.env.BASE_URL}assets/images/ui/01_ui/icones/heart_vazio_16x16.png`,
    );

    const battlePath = `${import.meta.env.BASE_URL}assets/images/ui/02_batalha/`;
    this.load.image(
      'boss-battle-background',
      `${import.meta.env.BASE_URL}assets/images/ui/07_cenario/fundo_batalha_320x180.png`,
    );
    this.load.image(
      'boss-battle-box',
      `${battlePath}caixa/caixa_batalha_9slice_24x24.png`,
    );
    this.load.image(
      'boss-soul',
      `${battlePath}alma/alma_cadeado_escudo_32x32.png`,
    );
    this.load.image(
      'boss-token-2fa',
      `${import.meta.env.BASE_URL}assets/images/ui/01_ui/icones/token_2fa_16x16.png`,
    );
    this.load.image(
      'boss-banner',
      `${bannerPath}banner_boss_192x32.png`,
    );
    this.load.image(
      'victory-banner',
      `${bannerPath}banner_vitoria_128x40.png`,
    );

    for (const [key, file, frameWidth, frameHeight] of [
      ['boss-trojan-idle', 'Trojan-idle-sheet.png', 512, 512],
      ['boss-trojan-speaking', 'Trojan-speaking-sheet.png', 480, 360],
      ['boss-trojan-jumping', 'Trojan-jumping-sheet.png', 512, 576],
    ]) {
      this.load.spritesheet(
        key,
        `${import.meta.env.BASE_URL}assets/images/sprites/Trojan-Final-Boss/${file}`,
        { frameWidth, frameHeight },
      );
    }

    for (const [key, file] of [
      ['boss-action-analyze', 'btn_analisar_112x32_4f.png'],
      ['boss-action-defend', 'btn_defender_112x32_4f.png'],
      ['boss-action-report', 'btn_denunciar_112x32_4f.png'],
      ['boss-action-item', 'btn_item_112x32_4f.png'],
    ]) {
      this.load.spritesheet(key, `${battlePath}menu/${file}`, {
        frameWidth: 112,
        frameHeight: 32,
      });
    }

    for (const [key, file, frameWidth, frameHeight] of [
      ['boss-projectile-spam', 'spam_envelope_16x16_2f.png', 16, 16],
      ['boss-projectile-bruteforce', 'forca_bruta_caracteres_16x16_18f.png', 16, 16],
      ['boss-projectile-popup', 'popup_falso_34x26_3f.png', 34, 26],
      ['boss-explosion', 'explosao_32x32_5f.png', 32, 32],
    ]) {
      const folder = key === 'boss-explosion' ? '08_efeitos/' : '02_batalha/projeteis/';
      this.load.spritesheet(
        key,
        `${import.meta.env.BASE_URL}assets/images/ui/${folder}${file}`,
        { frameWidth, frameHeight },
      );
    }
  }

  create() {
    const { width, height } = this.scale;

    this.add.image(width / 2, height / 2 - 60, MENU_ASSETS.logo)
      .setScale(1.5);

    this.add.text(width / 2, height / 2 + 75, 'UMA AVENTURA NA REDE KYBER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: COLORS.text,
    }).setOrigin(0.5);

    this.startPrompt = this.add.text(width / 2, height / 2 + 190, 'CLIQUE OU PRESSIONE UMA TECLA', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: COLORS.text,
    }).setOrigin(0.5).setVisible(false);

    this.tweens.add({
      targets: this.startPrompt,
      alpha: 0.35,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    const progress = { value: 0 };
    this.drawProgress(0);
    this.tweens.add({
      targets: progress,
      value: 1,
      duration: LOADING_DURATION,
      onUpdate: () => this.drawProgress(progress.value),
      onComplete: () => {
        this.isReady = true;
        this.loadingLabel.setText('CARREGAMENTO CONCLUÍDO');
        this.startPrompt.setVisible(true);
      },
    });

    this.input.on('pointerdown', this.openMenu, this);
    this.input.keyboard.on('keydown', this.openMenu, this);
  }

  drawProgress(progress) {
    const { barX, barY, barWidth, barHeight } = this.progressBarBounds;
    this.loadingBar.clear();
    this.loadingBar.fillStyle(COLORS.accent, 1);
    this.loadingBar.fillRect(
      barX + 3,
      barY + 3,
      (barWidth - 6) * progress,
      barHeight - 6,
    );
    this.loadingProgress.setText(`${Math.round(progress * 100)}%`);
  }

  openMenu() {
    if (!this.isReady) return;
    this.scene.start('MenuScene');
  }
}