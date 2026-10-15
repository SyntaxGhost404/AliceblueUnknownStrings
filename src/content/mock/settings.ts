// MOCK DATA — placeholder values for the Settings screen. The store listing, studio accounts and
// the progress tracker don't exist for this build yet, so every outgoing link is empty and its
// button stays inert (same convention as SOCIAL_LINKS in src/config.ts).

/** Text handed to the system share sheet by the "Share" row. */
export const SHARE_MESSAGE = '[Placeholder] Come and play this mystery story game! The store link goes here.';

/** Progress-tracker web page opened by "Track Progress". */
export const TRACKER_LINK = '';

/** Community links beyond the three already in SOCIAL_LINKS (discord, instagram, twitter). */
export const EXTRA_SOCIAL_LINKS: { name: 'reddit' | 'tiktok'; link: string }[] = [
  { name: 'reddit', link: '' },
  { name: 'tiktok', link: '' },
];

/**
 * Shop banners (new episode, saver pack, sidetrails, remove ads). The reference opens purchase
 * dialogs from them; this build has no store, so they are drawn but do nothing. Flip to hide.
 */
export const SHOW_SHOP_BANNERS = true;
