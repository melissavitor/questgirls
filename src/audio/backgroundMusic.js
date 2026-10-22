const BACKGROUND_MUSIC_VOLUME = 0.75;

export function playBackgroundMusic(scene, key) {
  const registry = scene.registry;
  const currentMusic = registry.get('backgroundMusic');
  const transitionId = (registry.get('backgroundMusicTransitionId') ?? 0) + 1;
  registry.set('backgroundMusicTransitionId', transitionId);

  if (currentMusic?.key === key && currentMusic.isPlaying) {
    scene.tweens.killTweensOf(currentMusic);
    scene.tweens.add({
      targets: currentMusic,
      volume: BACKGROUND_MUSIC_VOLUME,
      duration: 900,
      ease: 'Sine.easeInOut',
    });
    return currentMusic;
  }

  const startMusic = () => {
    const music = scene.sound.add(key, { loop: true, volume: 0 });
    registry.set('backgroundMusic', music);
    music.play();
    scene.tweens.add({
      targets: music,
      volume: BACKGROUND_MUSIC_VOLUME,
      duration: 900,
      ease: 'Sine.easeInOut',
    });
  };

  if (!currentMusic?.isPlaying) {
    currentMusic?.destroy();
    startMusic();
    return registry.get('backgroundMusic');
  }

  scene.tweens.killTweensOf(currentMusic);
  scene.tweens.add({
    targets: currentMusic,
    volume: 0,
    duration: 500,
    ease: 'Sine.easeInOut',
    onComplete: () => {
      currentMusic.stop();
      currentMusic.destroy();
      if (registry.get('backgroundMusicTransitionId') === transitionId) {
        startMusic();
      }
    },
  });

  return currentMusic;
}
