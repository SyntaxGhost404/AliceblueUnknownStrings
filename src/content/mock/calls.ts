import { PhoneName } from '../types';
import { CallScriptX } from './callTypes';

// MOCK DATA — placeholder call scripts. Keys: contact -> story position ("e<ep>o<obj>c<cp>",
// "e<ep>o<obj>", or "generic" for any time). Scripts are either flat (lines + one round of replies)
// or a state graph (`states`, see callTypes.ts). Contact keys come from contacts.ts or callHistory.ts.
export const calls: Record<PhoneName, Record<string, Record<string, CallScriptX>>> = {
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
    // A conversation with a second round of replies and a "Share Your Screen" beat.
    wife: {
      generic: {
        delay: 3500,
        method: 'conversation',
        lines: [],
        states: {
          '#0': {
            lines: [{ text: '[Placeholder] Hi! Are you still at work?', duration: 2200 }],
            replies: [
              { text: '[Placeholder] Yes, a few more hours.', next: '#1' },
              { text: '[Placeholder] Almost done here.', next: '#2' },
            ],
          },
          '#1': {
            lines: [
              { text: '[Placeholder] Yes, a few more hours.', duration: 1800, speaker: 'player' },
              { text: '[Placeholder] Can you show me what you are working on?', duration: 2600 },
            ],
            shareScreen: { next: '#3' },
          },
          '#2': {
            lines: [
              { text: '[Placeholder] Almost done here.', duration: 1600, speaker: 'player' },
              { text: "[Placeholder] Okay, don't be too late.", duration: 2000 },
            ],
            end: true,
          },
          '#3': {
            lines: [{ text: '[Placeholder] Thanks, I can see it. See you later!', duration: 2600 }],
            end: true,
          },
        },
      },
    },
    // A recorded message: character view without replies.
    unknown: {
      generic: {
        delay: 4000,
        method: 'automated',
        lines: [],
        states: {
          '#0': {
            lines: [
              { text: '[Placeholder] The person you are calling is not available.', duration: 2800 },
              { text: '[Placeholder] Please try again later.', duration: 2000 },
            ],
            end: true,
          },
        },
      },
    },
    // A friend who keeps talking in the floating call bubble while you use the phone.
    friend: {
      generic: {
        delay: 3000,
        method: 'conversation',
        lines: [],
        states: {
          '#0': {
            lines: [{ text: '[Placeholder] Hey! Do you have a minute?', duration: 2200 }],
            next: '#1',
          },
          '#1': {
            mode: 'floating',
            lines: [{ text: '[Placeholder] Keep using your phone, I will stay on the line.', duration: 3000 }],
            replies: [
              { text: '[Placeholder] Okay, one moment.', next: '#2' },
              { text: '[Placeholder] Sure, go ahead.', next: '#2' },
            ],
          },
          '#2': {
            lines: [{ text: '[Placeholder] Great, talk to you soon.', duration: 2200 }],
            end: true,
          },
        },
      },
    },
    // A phone menu: keypad digits instead of replies.
    hotline: {
      generic: {
        delay: 3000,
        lines: [],
        states: {
          '#0': {
            lines: [
              { text: '[Placeholder] Welcome. Press 1 for opening hours, or 2 to enter your four digit code.', duration: 4500 },
            ],
            inputs: [
              { keys: '1', next: '#1' },
              { keys: '2', next: '#2' },
            ],
          },
          '#1': {
            lines: [{ text: '[Placeholder] We are open every day. Goodbye.', duration: 2600 }],
            end: true,
          },
          '#2': {
            lines: [{ text: '[Placeholder] Please enter your code.', duration: 2200 }],
            inputs: [{ keys: '1234', next: '#3' }],
            inputLimit: 4,
          },
          '#3': {
            lines: [{ text: '[Placeholder] Thank you. Your code was accepted. Goodbye.', duration: 3000 }],
            end: true,
          },
        },
      },
    },
  },
  // Zoey's phone cannot place calls, but a call that comes in can still be answered.
  herphone: {
    zoeysmom: {
      generic: {
        method: 'automated',
        lines: [],
        states: {
          '#0': {
            lines: [
              { text: '[Placeholder] Hi sweetheart, it is me. Call me back when you can.', duration: 3200 },
              { text: '[Placeholder] Love you, bye!', duration: 1600 },
            ],
            end: true,
          },
        },
      },
    },
  },
};
