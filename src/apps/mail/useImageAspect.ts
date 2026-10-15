import { useEffect, useState } from 'react';
import { Image, ImageSourcePropType } from 'react-native';

/**
 * Width / height of an image source (0 until known). Bundled images carry their size; sources
 * that only have a uri (web builds, remote pictures) are measured with `Image.getSize`.
 */
export default function useImageAspect(source: ImageSourcePropType | undefined) {
  const [aspect, setAspect] = useState(0);

  useEffect(() => {
    if (!source) {
      setAspect(0);
      return;
    }
    const resolved = Image.resolveAssetSource(source);
    if (resolved?.width && resolved?.height) {
      setAspect(resolved.width / resolved.height);
      return;
    }
    let cancelled = false;
    if (resolved?.uri) {
      Image.getSize(
        resolved.uri,
        (width, height) => {
          if (!cancelled && height) setAspect(width / height);
        },
        () => {},
      );
    }
    return () => {
      cancelled = true;
    };
  }, [source]);

  return aspect;
}
