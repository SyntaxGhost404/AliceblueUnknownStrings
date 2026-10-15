// MOCK DATA and interface copy for the menu-style modals (credits, help/FAQ, languages, cloud
// saves, reset progress, prologue ending). Names, FAQ entries and links are placeholders; the
// labels match the reference build so the dialogs read the same. Copy that already lives in
// `getGeneral` (credits, help, progress, settings, faq) is read from there instead.

export type CreditPerson = { name: string; link: string };
export type CreditTrack = { name: string; artist: string; link: string };
export type CreditVoice = { name: string; artist: string };

export const credits: { creators: CreditPerson[]; music: CreditTrack[]; voiceovers: CreditVoice[] } = {
  creators: [
    { name: 'Placeholder Name', link: '' },
    { name: 'Placeholder Name', link: '' },
    { name: 'Placeholder Name', link: '' },
  ],
  music: [
    { name: 'Placeholder Track A', artist: 'Placeholder Artist', link: '' },
    { name: 'Placeholder Track B', artist: 'Placeholder Artist', link: '' },
    { name: 'Placeholder Track C', artist: 'Placeholder Artist', link: '' },
    { name: 'Placeholder Track D', artist: 'Placeholder Artist', link: '' },
    { name: 'Placeholder Track E', artist: 'Placeholder Artist', link: '' },
    { name: 'Placeholder Track F', artist: 'Placeholder Artist', link: '' },
  ],
  voiceovers: [
    { name: 'Character A', artist: 'Placeholder Name' },
    { name: 'Character B', artist: 'Placeholder Name' },
    { name: 'Character C', artist: 'Placeholder Name' },
    { name: 'Character D', artist: 'Placeholder Name' },
    { name: 'Character E', artist: 'Placeholder Name' },
    { name: 'Character F', artist: 'Placeholder Name' },
    { name: 'Character G', artist: 'Placeholder Name' },
    { name: 'Character H', artist: 'Placeholder Name' },
  ],
};

/** Extra placeholder FAQ entries, listed after the ones in `getGeneral('faq', ...)`. */
export const faqExtra: { question: string; answer: string }[] = [
  { question: '[Placeholder] How do I change the language?', answer: '[Placeholder] Answer text goes here.' },
  { question: '[Placeholder] Can I play without an account?', answer: '[Placeholder] Answer text goes here.' },
  { question: '[Placeholder] How do I replay an episode?', answer: '[Placeholder] Answer text goes here.' },
  { question: '[Placeholder] The sound is missing.', answer: '[Placeholder] Check the Sound toggle in Settings.' },
  { question: '[Placeholder] Where can I follow news?', answer: '[Placeholder] Answer text goes here.' },
];

/** Address behind "Contact support" (placeholder). */
export const supportEmail = 'support@example.com';

/** Languages offered by the language picker. Only English ships in this build. */
export type LanguageOption = { code: string; displayName: string; rtl?: boolean; available: boolean };

export const languages: LanguageOption[] = [
  { code: 'en', displayName: 'English', available: true },
  { code: 'ar', displayName: 'اَلْعَرَبِيَّةُ', rtl: true, available: false },
  { code: 'po', displayName: 'Portuguese', available: false },
  { code: 'es', displayName: 'Spanish', available: false },
  { code: 'tu', displayName: 'Türkçe', available: false },
];

export const defaultLanguage = 'en';

/** Channels listed by the "new episode" dialog; links come from `SOCIAL_LINKS` in config. */
export const newEpisodeChannels: { key: 'discord' | 'instagram' | 'twitter'; name: string; description: string }[] = [
  { key: 'discord', name: 'Discord', description: 'Discuss theories' },
  { key: 'instagram', name: 'Instagram', description: 'Latest content' },
  { key: 'twitter', name: 'Twitter', description: 'Announcements' },
];

/** Lines shown, one at a time, while Zoey's phone boots at the end of the prologue. */
export const phoneBootLines = [
  'Booting...',
  'Initializing...',
  'Recovering data...',
  'Finishing up...',
  'Recovered data successfully',
];

/** Interface copy used only by the modals (everything else comes from `getGeneral`). */
export const copy = {
  welcome: 'Welcome, ',
  startEpisode: 'Start Episode',
  confirm: 'Confirm',
  moreLanguages: 'More languages coming soon.',
  resetting: 'Resetting progress...',
  prologue: 'Prologue',
  episode: 'Episode',
  trail: 'Trail',
  cloud: {
    linkAccount: 'LINK ACCOUNT',
    linkedAccount: 'LINKED ACCOUNT',
    intro: 'You can now link your account to save your progress online.',
    introButton: 'Link Account',
    noThanks: 'No thanks',
    options: 'Link your account to save progress online!',
    linkedWith: 'Account linked with ',
    saved: 'Progress is being saved on Cloud.',
    syncWithCloud: 'Sync with cloud',
    unlink: 'Unlink account',
    deleteAccount: 'Delete account',
    deleteConfirm: 'Are you sure you want to delete your account?',
    deleteWarning: 'You will lose all your saved progress on the cloud.',
    deleting: 'Deleting account...',
    yes: 'Yes',
    no: 'No',
    conflict: 'Saved game data with different progress found on the cloud. Select the data you wish to use and sync.',
    local: 'Local',
    cloud: 'Cloud',
    mainStory: 'Main Story',
    sync: 'Sync',
    cancel: 'Cancel',
    google: 'Google',
    apple: 'Apple',
  },
};
