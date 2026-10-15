import type assets from '../../assets';

type SessionPoint = [number, number, number];

// MOCK DATA — placeholder inbox for Zoey's Mail app. Same shape as the reference build's mail
// list (sender key, subject, optional picture, release time, story window) with all story text
// replaced by neutral copy. Replace with real content later.

export type MailSender = { name: string; email: string };

/** Attachment card; `image` is `<asset folder>/<asset key>` (see getAppImage). */
export type MailAttachment = { name: string; type: string; image: string };

/** Pulsing clue spot over a picture mail (gathered through `mail:<id>`). Positions are % of the picture. */
export type MailHotspot = { image: keyof typeof assets.mail; top: string; left: string; width: string; aspectRatio: number };

export type Mail = {
  id: string;
  /** Key of `mailSenders`. */
  from: string;
  subject: string;
  /** Plain-text body, used when the mail has no picture. */
  body?: string;
  /** Picture mail: the picture is the whole body (key in src/assets/mail). */
  image?: keyof typeof assets.mail;
  /** Small picture shown under a text body. */
  withimage?: keyof typeof assets.mail;
  /** Release time (ISO); the mail shows once the in-game clock has passed it. */
  time: string;
  /** Story window in which the mail is in the inbox, as for every timed item. */
  start?: SessionPoint;
  end?: SessionPoint;
  attachments?: MailAttachment[];
  hotspot?: MailHotspot;
  /** Not in the inbox until a story action delivers it (`updateAppState('herphone', 'mail', { delivered })`). */
  deliveredOnly?: boolean;
};

export const mailSenders: Record<string, MailSender> = {
  family: { name: 'Family Contact', email: 'family.contact@example.test' },
  daily: { name: 'Alpha Daily', email: 'daily@example.test' },
  store: { name: 'Beta Store', email: 'store@example.test' },
  clinic: { name: 'Clinic Gamma', email: 'clinic@example.test' },
  club: { name: 'Delta Club', email: 'club@example.test' },
  studio: { name: 'Echo Studio', email: 'studio@example.test' },
  bank: { name: 'Foxtrot Finance', email: 'finance@example.test' },
  shelter: { name: 'Golf Shelter', email: 'shelter@example.test' },
  friend: { name: 'Hotel Friend', email: 'friend@example.test' },
};

// Newest first, like an inbox; the order below is the display order.
export const mails: Mail[] = [
  {
    id: 'welcome_note',
    from: 'family',
    subject: '[Placeholder] Where are you?',
    body: '[Placeholder] This is the body of a plain text mail.\n\nIt can run over several paragraphs, so the layout of a longer message can be checked.\n\n[Placeholder] Sign-off',
    time: '2023-01-05T00:00:00.000',
  },
  {
    id: 'weekly_digest',
    from: 'daily',
    subject: '[Placeholder] This week in brief',
    image: 'artexhibitlaunch',
    time: '2023-01-04T00:00:00.000',
  },
  {
    id: 'daily_deal',
    from: 'store',
    subject: '[Placeholder] Daily deal inside',
    image: 'fiesta',
    time: '2023-01-04T00:00:00.000',
  },
  {
    id: 'checkup_reminder',
    from: 'clinic',
    subject: '[Placeholder] Reminder for your next visit',
    body: '[Placeholder] This is a reminder about an upcoming appointment. Nothing here is real.',
    time: '2023-01-03T00:00:00.000',
  },
  {
    id: 'party_invite',
    from: 'friend',
    subject: '[Placeholder] You are invited',
    image: 'houseparty',
    time: '2023-01-03T00:00:00.000',
    // Clue spot over the picture: gather id `mail:party_invite`.
    hotspot: { image: 'partyinviteinfo', top: '76.3%', left: '33.4%', width: '35.81%', aspectRatio: 0.99 },
  },
  {
    id: 'event_invite',
    from: 'club',
    subject: '[Placeholder] Event invitation',
    image: 'fantasyball',
    time: '2023-01-02T00:00:00.000',
  },
  {
    id: 'project_file',
    from: 'studio',
    subject: '[Placeholder] Files for the project',
    body: '[Placeholder] The files are attached to this mail. Tap one to preview it.',
    withimage: 'lilyprojectfile',
    attachments: [
      { name: 'placeholder-document.pdf', type: 'PDF', image: 'mail/littlehamsters' },
      { name: 'placeholder-photo.png', type: 'PNG', image: 'gallery/tree' },
    ],
    time: '2023-01-02T00:00:00.000',
  },
  {
    id: 'club_news',
    from: 'club',
    subject: '[Placeholder] Club newsletter',
    body: '[Placeholder] Newsletter text. Picture mails fill the screen with an image instead of text.',
    time: '2023-01-01T00:00:00.000',
  },
  {
    id: 'finance_notice',
    from: 'bank',
    subject: '[Placeholder] An update about your application',
    body: '[Placeholder] A short notice with no picture and no attachments.',
    time: '2022-12-31T00:00:00.000',
  },
  {
    id: 'shelter_update',
    from: 'shelter',
    subject: '[Placeholder] News from the shelter',
    body: '[Placeholder] Another plain text mail further down the inbox.',
    time: '2022-12-30T00:00:00.000',
  },
  // Arrives once the story reaches the second objective of episode 1.
  {
    id: 'late_message',
    from: 'friend',
    subject: '[Placeholder] A message that arrives later',
    body: '[Placeholder] This mail only appears after the story reaches its window.',
    time: '2023-01-05T00:00:00.000',
    start: [1, 1, 0],
  },
  {
    id: 'late_offer',
    from: 'daily',
    subject: '[Placeholder] Another late arrival',
    image: 'littlehamsters',
    time: '2023-01-05T00:00:00.000',
    start: [1, 1, 0],
  },
  // Delivered by a story action instead of a window.
  {
    id: 'delivered_note',
    from: 'family',
    subject: '[Placeholder] Delivered by a story action',
    body: '[Placeholder] A story action put this mail in the inbox.',
    time: '2023-01-05T00:00:00.000',
    deliveredOnly: true,
  },
];

export const mailStrings = { from_unknown: 'Unknown sender' };
