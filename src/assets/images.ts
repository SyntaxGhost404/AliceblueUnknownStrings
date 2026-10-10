import { ImageSourcePropType } from 'react-native';
import assets from './index';

// Lookup helpers mirroring the reference build's image registry, so screens can ask for
// "the small Messages logo" or "Zoey's avatar" without knowing file layout.

type AssetMap = Record<string, ImageSourcePropType>;
const folder = (name: keyof typeof assets) => assets[name] as unknown as AssetMap;

export function getAppLogo(app: string, size?: 'small' | 'normal'): ImageSourcePropType | undefined {
  const apps = folder('apps');
  if (size === 'small') return apps[`${app}_small`] ?? apps[app];
  return apps[app];
}

const appImages: Record<string, Record<string, ImageSourcePropType>> = {
  messages: { background: assets.messages.background, header: assets.messages.header },
};

export function getAppImage(app: string, key: string): ImageSourcePropType | undefined {
  return appImages[app]?.[key] ?? (assets as any)[app]?.[key];
}

export function getContactImage(name: string | undefined): ImageSourcePropType | undefined {
  if (!name) return undefined;
  return folder('characters')[name] ?? folder('characters').unknown;
}

const others: Record<string, ImageSourcePropType> = {
  zoeyLockscreen: assets.lockscreen.zoey,
  detectiveLockscreen: assets.lockscreen.detective,
};

export function getOther(key: string): ImageSourcePropType | undefined {
  return others[key];
}

// Desk objects come in a `normal` variant plus optional alternates (e.g. a zoomed `big`
// version or the phone's lit `on` state).
const deskVariants: Record<string, Record<string, string>> = {
  myphone: { on: 'myphone2' },
  herphone: { big: 'herphone-big' },
  casereport: { big: 'casereport-big' },
  newspaperkevin: { big: 'newspaperkevin-big' },
  newspaperadamkevin: { big: 'newspaperadamkevin-big' },
  fallenframe: { big: 'fallenframebig' },
};

export function getSuspectBoardObject(name: string, variant?: string): ImageSourcePropType | undefined {
  const desk = folder('suspectboard');
  const alt = variant ? deskVariants[name]?.[variant] : undefined;
  return (alt && desk[alt]) || desk[name];
}
