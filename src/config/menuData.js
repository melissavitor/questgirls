export const START_SCENE = 'PhaseBannerScene';

const playerMapSprites = (character, folder) => {
  const animations = [
    ['idle-down', 13],
    ['walk-down', 16],
    ['idle-up', 8],
    ['walk-up', 8],
    ['idle-left', 8],
    ['walk-left', 8],
    ['idle-right', 8],
    ['walk-right', 8],
  ];

  return animations.map(([name, frameCount]) => ({
    key: `player-${character}-${name}`,
    path: `assets/images/sprites/${folder}/map-${character}-${name}.png`,
    name,
    frameCount,
  }));
};

export const MENU_ASSETS = {
  logo: 'logo_guardiao_do_firewall_300x118',
  playButton: 'btn_jogar_96x32_4f',
  creditsButton: 'btn_creditos_96x32_4f',
  continueButton: 'btn_continuar_96x32_4f',
  backButton: 'btn_voltar_96x32_4f',
};
 
export const CHARACTERS = [
  {
    id: 'leia',
    name: 'LEIA',
    description: 'RÁPIDA E\nCURIOSA',
    color: 0xff3fa4,
    image: 'menu-character-leia',
    animation: 'menu-leia-idle',
    spriteSheetPath: 'assets/images/sprites/Sprites-Leia/Leia-frente-parada-sheet.png',
    mapSprites: playerMapSprites('leia', 'Sprites-Leia'),
  },
  {
    id: 'luke',
    name: 'LUKE',
    description: 'CALMO E\nESTRATEGISTA',
    color: 0x3fd0e0,
    image: 'menu-character-luke',
    animation: 'menu-luke-idle',
    spriteSheetPath: 'assets/images/sprites/Sprites-Luke/Luke-frente-parado-sheet.png',
    mapSprites: playerMapSprites('luke', 'Sprites-Luke'),
  },
];

export const CREDITS = [
  'EQUIPE QUESTGIRLS',
  'Luísa Braga Nery de Lima',
  'Maria Luiza Pinholate',
  'Melissa Vitor da Silva',
  'Sara Da Cruz Freitas',
  '',
  'FEITO COM PHASER',
  '',
  'FONTE: PRESS START 2P',
  'CODEMAN38 · LICENÇA SIL OFL 1.1',
  '',
  'MAPA',
  'Created by dylestorm (www.livingtheindie.com)',
  '',
  'TRILHA SONORA E EFEITOS SONOROS',
  "Afterburner (music track) by Paolo D'Emilio from OpenGameArt",
  '06-06-19 Synthwave by Spring from OpenGameArt',
  'Organic-Ui Inventory Weapon-Ui Gun Equipment Game-Audio Menu Select Layers Random-Pitch Futuristic Satisfying Sci-Fi by dimapain -- https://freesound.org/s/863791/ -- License: Attribution 4.0',
];
