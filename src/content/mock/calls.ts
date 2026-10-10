import { CallScript, PhoneName } from '../types';

// MOCK DATA — placeholder call scripts. Keys: contact -> story position ("e<ep>o<obj>c<cp>",
// "e<ep>o<obj>", or "generic" for any time).
export const calls: Record<PhoneName, Record<string, Record<string, CallScript>>> = {
  myphone: {
    colleague: {
      e1o1c1: {
        lines: [
          { text: '[Placeholder] Hey. Did you find anything on her phone?', duration: 2600 },
        ],
        options: [
          {
            text: '[Placeholder] A couple of things.',
            lines: [
              { text: '[Placeholder] A couple of things, yes.', duration: 2000, speaker: 'player' },
              { text: '[Placeholder] Good. Write it all down, we will talk tomorrow.', duration: 2800 },
            ],
            action: { app: 'episode', delay: 1500 },
          },
          {
            text: '[Placeholder] Not yet.',
            lines: [
              { text: '[Placeholder] Not yet.', duration: 1600, speaker: 'player' },
              { text: '[Placeholder] Keep looking. Call me tomorrow.', duration: 2400 },
            ],
            action: { app: 'episode', delay: 1500 },
          },
        ],
      },
      generic: {
        delay: 3000,
        lines: [{ text: "[Placeholder] I'm busy right now, call me later.", duration: 2400 }],
      },
    },
    wife: {
      generic: {
        delay: 3500,
        lines: [
          { text: '[Placeholder] Hi! Are you still at work?', duration: 2200 },
          { text: "[Placeholder] Okay, don't be too late.", duration: 2000 },
        ],
      },
    },
  },
  herphone: {},
};
