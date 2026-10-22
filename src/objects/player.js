import Phaser from 'phaser';

const PLAYER_SPEED = 90;
export const MAP_CHARACTER_SIZE = 36;

export default class Player {
  constructor(scene, character, spawn, map) {
    this.scene = scene;
    this.character = character;
    this.map = new Map(character.mapSprites.map((sprite) => [sprite.name, sprite.key]));
    this.facing = spawn.facing ?? 'down';

    const initialTexture = this.map.get('idle-down');
    this.sprite = scene.physics.add.sprite(spawn.x, spawn.y, initialTexture)
      .setOrigin(0.5)
      .setDisplaySize(MAP_CHARACTER_SIZE, MAP_CHARACTER_SIZE)
      .setDepth(10 + spawn.y);

    this.sprite.body.setSize(96, 96).setOffset(80, 128);
    this.sprite.setCollideWorldBounds(true);
    map.collide(this.sprite);
    map.trackDepth(this.sprite);

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys('W,A,S,D');
    this.stepSound = scene.sound.add('player-step', { volume: 0.22, loop: false });
    this.lastStepAt = 0;
    this.sprite.play(this.map.get(`idle-${this.facing}`));
  }

  update(canMove) {
    const body = this.sprite.body;
    if (!canMove) {
      body.setVelocity(0, 0);
      return;
    }

    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const up = this.cursors.up.isDown || this.keys.W.isDown;
    const down = this.cursors.down.isDown || this.keys.S.isDown;
    let velocityX = Number(right) - Number(left);
    let velocityY = Number(down) - Number(up);

    if (velocityX !== 0 && velocityY !== 0) {
      const velocity = new Phaser.Math.Vector2(velocityX, velocityY).normalize();
      velocityX = velocity.x;
      velocityY = velocity.y;
    }

    body.setVelocity(velocityX * PLAYER_SPEED, velocityY * PLAYER_SPEED);

    if (velocityX !== 0 || velocityY !== 0) {
      this.facing = Math.abs(velocityX) > Math.abs(velocityY)
        ? velocityX < 0 ? 'left' : 'right'
        : velocityY < 0 ? 'up' : 'down';
    }

    const isMoving = velocityX !== 0 || velocityY !== 0;
    const state = isMoving ? 'walk' : 'idle';
    const animation = this.map.get(`${state}-${this.facing}`);
    if (this.sprite.anims.getName() !== animation) {
      this.sprite.play(animation, true);
    }

    if (isMoving && this.scene.time.now - this.lastStepAt > 220) {
      this.lastStepAt = this.scene.time.now;
      this.stepSound.play();
    }
  }

  destroy() {
    this.sprite.destroy();
  }
}