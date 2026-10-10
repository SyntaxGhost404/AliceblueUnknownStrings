import Sound from 'react-native-sound';

// Sound effects live in android/app/src/main/res/raw as `sound_<name>.mp3`
// (same layout as the reference build). Callers refer to them by bare file name.
Sound.setCategory('Playback', true);

const SFX_VOLUME = 0.8;

export type GameSound = Sound;

/**
 * Loads a sound from the bundled raw resources. `onReady` fires once the file is
 * decoded (with the sound instance) or with `'error'` if it could not be loaded.
 */
export function createSound(name: string, onReady?: (sound: Sound | 'error') => void): Sound {
  const file = name.endsWith('.mp3') ? name : name + '.mp3';
  const sound: Sound = new Sound('sound_' + file, Sound.MAIN_BUNDLE, error => {
    if (error) {
      console.log('Loading sound: ' + file, error);
      onReady?.('error');
      return;
    }
    sound.setVolume(SFX_VOLUME);
    onReady?.(sound);
  });
  return sound;
}

/** Fire-and-forget one-shot effect, released once playback completes. */
export function playSound(name: string, volume?: number) {
  createSound(name, s => {
    if (s === 'error') return;
    if (volume !== undefined) s.setVolume(volume);
    s.play(() => s.release());
  });
}
