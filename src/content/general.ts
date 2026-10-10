// Interface copy (labels, prompts, system strings). These are UI strings, not story text;
// they match the reference build so screens read the same. Story-specific strings have been
// replaced with neutral placeholders.

const general = {
  apps: {
    messages: 'Messages',
    phone: 'Phone',
    call: 'Phone',
    mail: 'Mail',
    gallery: 'Gallery',
    diary: 'Diary',
    pixabowl: 'Pixabowl',
    files: 'Files',
    settings: 'Settings',
    archive: 'Archive',
    notes: 'Notes',
    browser: 'Browser',
    sidetrails: 'Sidetrails',
    calculator: 'Calculator',
    symmetry: 'Symmetry',
    recovery: 'Recovery',
    safemode: 'Safe mode',
  },
  credits: {
    created_by: 'Created by',
    music: 'Music',
    voiceovers: 'Voiceovers',
    back_to_game: 'Back to game',
  },
  help: {
    faq: 'Frequently Asked Questions',
    still_stuck: 'Still stuck?',
    contact_support: 'Contact support',
  },
  login: {
    new_game: 'New game',
    load_game: 'Load game',
    link_account_pretext: 'You can choose to link your account to save your progress online.',
    or: 'or',
    no_sign_in: 'Play without signing in',
    loading: 'Loading...',
  },
  gameplay: {
    adam_phone: "Adam's phone",
    zoey_phone: "Zoey's phone",
    adam_old_phone: "Adam's phone (old)",
    desk: 'Desk',
    use_headphones: 'Use headphones for a better experience',
    days_since_missing: 'Days since the case was opened',
    stuck_hint: 'Stuck? Take a hint',
    swipe_screens: 'Swipe to easily switch between screens',
    play_next_sidetrail: 'Play the next Sidetrail',
    mainstory_switch: 'Switch to main story',
    pause_sidetrail: 'Pause Sidetrail',
    adam: 'Adam',
    zoey: 'Zoey',
  },
  notifications: {
    new_item: 'A new item has arrived',
    missed_calls: 'missed calls',
    missed_family_calls: 'Mom (2), Dad (1) and 3 more',
    missed_call: 'Missed call',
    recovery_title: 'Recovering data...',
    recovery_subtitle: 'Manual input required',
    diary_title: 'Page 1 of your diary has been recovered',
    click_to_view: 'Click to view',
    box_arrived: 'A box has arrived on your desk',
    new_connection: 'A new connection has been added',
    new_deduction: 'A new deduction is ready',
    file_received: 'A new file has been received',
    video_downloaded: 'A new video file has been downloaded',
    file_retrieved: 'A new file has been retrieved',
    audio: 'Audio',
    image: 'Image',
    accept: 'Accept',
    decline: 'Decline',
  },
  progress: {
    reset_progress: 'RESET PROGRESS',
    irreversible_action: 'Note: This action is irreversible.',
    call_history: 'Call history will not be deleted.',
    main_story: 'Main Story',
    episode: 'Episode',
    sidetrails: 'Sidetrails',
    cancel: 'Cancel',
    reset: 'Reset',
  },
  settings: {
    linked_acc: 'Linked account',
    link_acc: 'Link account',
    language: 'Language',
    music: 'Music',
    sound: 'Sound',
    on: 'on',
    off: 'off',
    share: 'Share',
    rate_game: 'Rate the game',
    reset_progress: 'Reset progress',
    need_help: 'Need help?',
    credits: 'Credits',
    episode_info: 'Find out more about the next episode',
    track_progress: 'Track Progress',
    version: 'Version',
    sign_in_apple: 'Sign-in with Apple',
    sign_in_google: 'Sign-in with Google',
    user_id: 'User ID',
    downloading: 'Downloading...',
    game_restart: 'The game will restart.',
  },
  // Placeholder FAQ for the "Need help?" screen.
  faq: {
    question_1: '[Placeholder] I lost my game progress.',
    question_1_ans: '[Placeholder] Answer text goes here.',
    question_2: "[Placeholder] The objective isn't progressing.",
    question_2_ans: '[Placeholder] Take a hint from the notification panel if you are stuck.',
    question_3: '[Placeholder] When is the next episode coming?',
    question_3_ans: '[Placeholder] Answer text goes here.',
  },
} as const;

export type GeneralSection = keyof typeof general;

export function getGeneral(section: GeneralSection | string, key: string): string {
  const table = (general as Record<string, Record<string, string>>)[section];
  return table?.[key] ?? key;
}

export default general;
