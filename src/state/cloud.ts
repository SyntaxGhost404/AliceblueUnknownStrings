import { retrieveItem, storeItem } from './storage';
import { Session } from '../content/types';

// Local stand-in for the reference build's account/cloud-save service. Signing in creates
// a local profile; while signed in, every save is mirrored under a separate key so the
// login screen and the cloud-saves dialog can offer to restore it.

export type UserProfile = { id: string; name: string; provider: 'google' | 'apple' };

export type CloudSave = {
  session: Session;
  percentage: number;
  savedAt: string;
  data: Record<string, unknown>;
};

export const mockCloud = {
  async signIn(provider: 'google' | 'apple'): Promise<UserProfile> {
    const profile: UserProfile = { id: 'local-player', name: 'Player', provider };
    await storeItem('user', profile);
    return profile;
  },
  async signOut() {
    await storeItem('user', '');
  },
  async currentUser(): Promise<UserProfile | null> {
    const raw = await retrieveItem<string>('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  },
  async load(): Promise<CloudSave | null> {
    return retrieveItem<CloudSave>('cloud', true);
  },
  async save(save: CloudSave) {
    await storeItem('cloud', save);
  },
};
