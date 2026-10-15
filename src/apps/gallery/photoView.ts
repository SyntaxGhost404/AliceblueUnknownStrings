import { getAppImage } from '../../assets/images';
import { GalleryPhoto, findPhoto } from '../../content/mock/gallery';

/** Edit state at 50 means "untouched" for the contrast and blur tools. */
export const NEUTRAL = 50;

/** Opacity of a photo: darkness moves it away from 50 in either direction. */
export const photoOpacity = (darken = NEUTRAL) => 1 - Math.abs(darken - NEUTRAL) / NEUTRAL;

export const photoBlur = (blur = NEUTRAL) => Math.abs(blur - NEUTRAL);

/** Params the viewer is opened with (from the grid, or a story deep link). */
export type ImageViewParams = Partial<GalleryPhoto> & { id?: string };

/** Viewer photo from route params: an id of a known photo, optionally with explicit overrides. */
export function resolvePhoto(params: ImageViewParams | undefined): GalleryPhoto | undefined {
  if (!params) return undefined;
  const base = findPhoto(params.id);
  const image = params.image ?? base?.image;
  if (!image) return undefined;
  return { caption: '', ...base, ...params, id: params.id ?? image, image } as GalleryPhoto;
}

/** Params for opening the viewer on a photo of the grid. */
export const viewParams = (photo: GalleryPhoto): ImageViewParams => ({
  id: photo.id,
  image: photo.image,
  caption: photo.caption,
  mirror: photo.mirror,
  rotate: photo.rotate,
  blur: photo.blur,
  darken: photo.darken,
  hotspot: photo.hotspot,
});

/** Picture for an `<asset folder>/<asset key>` reference. */
export const refImage = (ref: string) => {
  const [folder, key] = ref.split('/');
  return getAppImage(folder, key);
};
