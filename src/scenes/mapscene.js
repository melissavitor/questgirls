import Phaser from 'phaser';
import { PALETTE } from '../config/palette.js';
import KyberMap from '../objects/kybermap.js';

const MAP_ASSET_PATH = '/assets/mapa/';

export default class MapScene extends Phaser.Scene {
  constructor() {
    super('MapScene');
  }

  preload() {
    KyberMap.preload(this, MAP_ASSET_PATH);
  }

  create() {
    this.mapIndex = 0;
    this.showMap();
    this.input.on('pointerdown', this.nextMap, this);
  }

  showMap() {
    this.kmap = new KyberMap(this, KyberMap.IDS[this.mapIndex], {
      animations: true,
      lights: true,
      showNpcs: false
    });

    const { width, height } = this.kmap.data;
    const camera = this.cameras.main;
    camera.setBackgroundColor(PALETTE.background);
    camera.setZoom(Math.min(this.scale.width / width, this.scale.height / height));
    camera.centerOn(width / 2, height / 2);
  }

  nextMap() {
    this.kmap.destroy();
    this.mapIndex = (this.mapIndex + 1) % KyberMap.IDS.length;
    this.showMap();
  }

  update(time) {
    this.kmap.update(time);
  }
}
