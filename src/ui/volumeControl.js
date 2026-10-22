import Phaser from 'phaser';

const VOLUME_REGISTRY_KEY = 'masterVolume';

const CONTROL = {
  left: 4,
  right: 152,
  top: 566,
  bottom: 595,
  sliderStart: 48,
  sliderEnd: 108,
  centerY: 581,
};

export function createVolumeControl(scene) {
  const savedVolume = scene.registry.get(VOLUME_REGISTRY_KEY);
  const initialVolume = savedVolume ?? scene.sound.volume;
  scene.sound.volume = initialVolume;
  scene.registry.set(VOLUME_REGISTRY_KEY, initialVolume);

  const container = scene.add.container(0, 0)
    .setScrollFactor(0)
    .setDepth(50000);
  const panel = scene.add.graphics();
  panel.fillStyle(0x100c1a, 0.9).fillRoundedRect(4, 566, 148, 29, 4);
  panel.lineStyle(1, 0x3b1f50, 1).strokeRoundedRect(4, 566, 148, 29, 4);
  container.add(panel);

  container.add(scene.add.text(11, 581, 'VOL', {
    fontFamily: '"Press Start 2P", monospace',
    fontSize: '6px',
    color: '#b6a9cf',
  }).setOrigin(0, 0.5));

  const slider = scene.add.graphics();
  const valueLabel = scene.add.text(116, 581, '', {
    fontFamily: '"Press Start 2P", monospace',
    fontSize: '6px',
    color: '#ffffff',
  }).setOrigin(0, 0.5);
  container.add([slider, valueLabel]);

  const drawSlider = (volume) => {
    const knobX = CONTROL.sliderStart
      + (CONTROL.sliderEnd - CONTROL.sliderStart) * volume;
    slider.clear();
    slider.fillStyle(0x3b1f50, 1).fillRoundedRect(
      CONTROL.sliderStart,
      CONTROL.centerY - 2,
      CONTROL.sliderEnd - CONTROL.sliderStart,
      4,
      2,
    );
    slider.fillStyle(0x3fd0e0, 1).fillRoundedRect(
      CONTROL.sliderStart,
      CONTROL.centerY - 2,
      knobX - CONTROL.sliderStart,
      4,
      2,
    );
    slider.fillStyle(0xffffff, 1).fillCircle(knobX, CONTROL.centerY, 4);
    valueLabel.setText(`${Math.round(volume * 100)}%`);
  };

  const setVolumeFromPointer = (pointer, event) => {
    event?.stopPropagation();
    const volume = Phaser.Math.Clamp(
      (pointer.x - CONTROL.sliderStart) / (CONTROL.sliderEnd - CONTROL.sliderStart),
      0,
      1,
    );
    scene.sound.volume = volume;
    scene.registry.set(VOLUME_REGISTRY_KEY, volume);
    drawSlider(volume);
  };

  const hitArea = scene.add.zone(
    (CONTROL.sliderStart + CONTROL.sliderEnd) / 2,
    CONTROL.centerY,
    CONTROL.sliderEnd - CONTROL.sliderStart + 12,
    CONTROL.bottom - CONTROL.top,
  ).setScrollFactor(0).setInteractive({ useHandCursor: true });
  hitArea.on('pointerdown', setVolumeFromPointer);
  hitArea.on('pointermove', (pointer, _localX, _localY, event) => {
    if (pointer.isDown) setVolumeFromPointer(pointer, event);
    else event?.stopPropagation();
  });
  container.add(hitArea);

  drawSlider(initialVolume);
  scene.volumeControl = container;
  scene.volumeControlBounds = CONTROL;
  if (scene.uiCamera) scene.cameras.main.ignore(container);
}

export function isVolumeControlPointer(scene, pointer) {
  const bounds = scene.volumeControlBounds;
  return Boolean(bounds
    && pointer.x >= bounds.left
    && pointer.x <= bounds.right
    && pointer.y >= bounds.top
    && pointer.y <= bounds.bottom);
}
