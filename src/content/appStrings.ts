// Per-app interface strings (labels, prompts, status lines). Generic UI copy matches the
// reference build; anything tied to the old story has been replaced with placeholders.

const appStrings = {
  myphone: {
    browser: {
      enter_website: 'Enter website...',
      recently_visited: 'Recently visited',
      suggested: 'Suggested',
      about_riverstone: '[Placeholder] About the town',
      riverstone_map: '[Placeholder] Town map',
    },
    messages: {
      online_none: 'No users are online',
      sent_file: 'Person sent a file',
      messages_deleted: '576 messages deleted',
      offline_one: 'Person is offline',
      online_one: 'Person is online',
      online_two: 'Person1 and Person2 are online',
      online_multiple: 'Person1, Person2, and Person3 are online',
      messages_failed_load: 'Failed to load older messages',
      typing_one: 'Person is typing',
      manual_input_crate_prompt: '[Placeholder] Enter the two numbers',
      manual_input_crate_display_text: '[Placeholder] First 1. Second 2.',
      manual_input_crate_field_room: '[Placeholder] First',
      manual_input_crate_field_crate: '[Placeholder] Second',
      unknown_number: 'Unknown Number',
      you: 'You',
      no_messages: 'No ongoing messages.',
      sent_image: 'Person sent an image',
      sent_audio: 'Person sent an audio',
      chatting_with: 'You are now chatting with Person',
    },
    notes: { confirm: 'Confirm' },
    phone: {
      saved_contact: 'Saved contact',
      caller_identified: 'Caller identified',
      today: 'Today',
      days_ago: '33d ago',
      call: 'Call',
      calling: 'Calling...',
      calling_unavailable: 'Calling functionality not detected on this device',
    },
  },
  herphone: {
    diary: {
      intro_text: '[Placeholder] Diary introduction. Every page is protected by a riddle.',
      page: 'Page',
      locked: 'Locked',
      not_recovered: 'Not recovered',
    },
    files: { video: 'Video' },
    gallery: { hidden: 'HIDDEN IMAGES', unlock_images: 'Unlock to view the hidden images' },
    mail: { to_me: 'to me', inbox: 'INBOX' },
    pixabowl: {
      username: 'USERNAME',
      password: 'PASSWORD',
      submit: 'Submit',
      forgot_pass: 'Forgot password?',
      sec_question_prompt: 'Answer the security question to login',
      sec_question: "What's your pet's name?",
      answer: 'Answer',
      login: 'Login',
      posts: 'Posts',
      incorrect_pass: 'Incorrect password',
      likes: 'likes',
    },
    symmetry: {
      symmetry: 'SYMMETRY',
      no_lives: 'Out of lives',
      game_optional: 'This game is optional to play and not part of the story',
      extra_life: '+1 Life',
      continue: 'Continue',
      retry: 'Retry',
      plus_five_moves: '+5 Moves',
      give_up: 'Give up',
      more_levels: 'More levels will be added soon',
    },
  },
  other: {
    connecttheclues: {
      connect_clues_pretext: 'Connect the relevant clues together',
      recreate_sequence_pretext: 'Select the events in the order they happened',
    },
    datarecovery: {
      recovery: 'Recovery',
      recovering_data: 'Recovering data...',
      manual_input: 'Manual Input Required',
      exit: 'Exit recovery mode',
      successfully_recovered: 'Successfully recovered...',
      click_finish: 'Click here to finish',
      chat: 'chat',
      chats: 'chats',
      email: 'email',
      emails: 'emails',
      photo: 'photo',
      photos: 'photos',
      video: 'video',
      videos: 'videos',
      file: 'file',
      files: 'files',
      app: 'app',
      apps: 'apps',
    },
  },
} as const;

type Group = keyof typeof appStrings;

/** Interface string for an app; falls back to the key. */
export function getAppString(group: Group | string, app: string, key: string): string {
  const table = (appStrings as any)[group]?.[app];
  return table?.[key] ?? key;
}

export default appStrings;
