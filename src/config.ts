// Project-level switches. The working title is a placeholder until the new game is named;
// it is drawn in the title screen's gold lettering (see TitleScreen).
export const GAME_TITLE = 'Aliceblue';

/** Gold used by the title lettering. */
export const TITLE_GOLD = '#D9B665';

/**
 * Community links shown in the notification shade. Leave a URL empty to keep the icon
 * as decoration only (no studio accounts are configured for this build yet).
 */
export const SOCIAL_LINKS: { name: 'discord' | 'instagram' | 'twitter'; link: string }[] = [
  { name: 'discord', link: '' },
  { name: 'instagram', link: '' },
  { name: 'twitter', link: '' },
];
