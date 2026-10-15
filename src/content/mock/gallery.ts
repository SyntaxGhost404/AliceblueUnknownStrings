import type { GameAction } from '../types';
import type assets from '../../assets';

type SessionPoint = [number, number, number];

// MOCK DATA — placeholder photo library for Zoey's Gallery. The pictures are the reference
// build's gallery images used as stand-ins; ids, dates, captions and the hidden-album pattern
// are neutral placeholders. Clue ids for the story are `gallery:<id>`.

export type GalleryKey = keyof typeof assets.gallery;

/** Pulsing spot over a photo (a clue that only exists while the story is in its window). */
export type PhotoHotspot = {
  image: GalleryKey;
  top: string;
  left: string;
  width: string;
  aspectRatio: number;
  start?: SessionPoint;
  end?: SessionPoint;
  /** Story action fired when the spot is tapped. */
  action?: GameAction;
};

export type GalleryPhoto = {
  id: string;
  /** Key in src/assets/gallery. */
  image: GalleryKey;
  caption: string;
  /** Starting state of the viewer's edit tools (blur and darken are neutral at 50). */
  mirror?: boolean;
  rotate?: number;
  blur?: number;
  darken?: number;
  start?: SessionPoint;
  end?: SessionPoint;
  hotspot?: PhotoHotspot;
};

const photo = (id: string, image: GalleryKey, extra: Partial<GalleryPhoto> = {}): GalleryPhoto => ({
  id,
  image,
  caption: `[Placeholder] Caption for ${id}`,
  ...extra,
});

/** Photos grouped by day (DD-MM-YYYY); the grid shows the newest day first. */
export const photosByDate: Record<string, GalleryPhoto[]> = {
  '05-01-2023': [photo('photo1', 'zoey-selfie'), photo('photo2', 'zoey-pose', { start: [1, 1, 0] })],
  '03-01-2023': [photo('photo3', 'jerry-sofa'), photo('photo4', 'family'), photo('photo5', 'jerry-eyes')],
  '29-12-2022': [
    photo('photo6', 'zoey-lily'),
    photo('photo7', 'zoey-betty', { start: [1, 1, 0] }),
    photo('photo8', 'jerry-sleep'),
  ],
  '24-12-2022': [
    photo('photo9', 'clock-jerry'),
    photo('photo10', 'clock-zoey-jerry'),
    photo('photo11', 'clock-mom-dad'),
    photo('photo12', 'clock-table'),
  ],
  '20-12-2022': [photo('photo13', 'jerry-sweater'), photo('photo14', 'jerry-towel'), photo('photo15', 'bicycle')],
  '18-12-2022': [
    photo('photo16', 'bracelets'),
    photo('photo17', 'tree'),
    // Mirrored: the flip tool turns it back.
    photo('photo18', 'fortune-cookie', { mirror: true, caption: '[Placeholder] A mirrored photo: try the flip tool' }),
  ],
  '15-12-2022': [
    photo('photo19', 'counselor-desk', {
      hotspot: { image: 'counselor-number', top: '38.3%', left: '14.4%', width: '67.96%', aspectRatio: 2.02, start: [1, 1, 0] },
    }),
    photo('photo20', 'jerry-pillow'),
  ],
  '12-12-2022': [
    // Dark and blurred: the edit tools bring it back to neutral (50).
    photo('photo21', 'jerry-birthday', {
      blur: 37,
      darken: 95,
      caption: '[Placeholder] An obscured photo: try the contrast and blur tools',
    }),
    photo('photo22', 'jerry-table'),
  ],
  '09-12-2022': [photo('photo23', 'jerry-curly'), photo('photo24', 'jerry-legs-dangling'), photo('photo25', 'jerry-napping')],
  '05-12-2022': [
    photo('photo26', 'jerry-thinking'),
    photo('photo27', 'scrabble'),
    photo('photo28', 'jerry-angry'),
    photo('photo29', 'zoey-posing'),
    photo('photo30', 'jerry-staring'),
  ],
};

/** Photos in the hidden album behind the pattern lock. */
export const hiddenPhotos: GalleryPhoto[] = [
  photo('hidden1', 'betty-vomit', { caption: '[Placeholder] A photo kept in the hidden album' }),
];

/** Every photo by id, for deep links such as `{ appScreen: 'imageview', data: { id: 'photo3' } }`. */
export function findPhoto(id: string | undefined): GalleryPhoto | undefined {
  if (!id) return undefined;
  return [...Object.values(photosByDate).flat(), ...hiddenPhotos].find(p => p.id === id);
}

/** Pattern that opens the hidden album: block indexes 0-8 (row by row) in tap order. */
export const HIDDEN_PATTERN = '012543678';

/** From this story point on, the hidden album is no longer locked. */
export const HIDDEN_UNLOCKED_FROM: SessionPoint = [2, 0, 0];
