import { ChatScript, PhoneName } from '../types';

// MOCK DATA — placeholder dialogue trees. Node ids follow the reference build's "#n" style.

type FillerMessage = { type: '-1' | '0' | '1'; text: string; time: string; sender?: string };

export const conversations: Record<PhoneName, Record<string, ChatScript>> = {
  myphone: {
    colleague: {
      '#0': { text: '[Placeholder] Hey, are you still at the office?', delay: 1200, next: '#1' },
      '#1': {
        text: "[Placeholder] I've sent something over. It should be on your desk.",
        delay: 1800,
        options: [
          { text: '[Placeholder] What is it?', next: '#2' },
          { text: "[Placeholder] I'm heading home.", next: '#3' },
          { text: null, next: '#3' },
        ],
      },
      '#2': { text: '[Placeholder] A new case. Take a look and let me know.', delay: 1500, next: '#4' },
      '#3': { text: '[Placeholder] Not before you check the box!', delay: 1500, next: '#4' },
      '#4': {
        text: '[Placeholder] Talk later.',
        delay: 1000,
        options: [{ text: '[Placeholder] Okay.', next: null, action: { app: 'objective', delay: 600 } }],
      },
    },
    wife: {
      '#0': { text: '[Placeholder] Will you be late again tonight?', delay: 1000, options: [{ text: '[Placeholder] Probably.', next: null }] },
    },
  },
  herphone: {
    zoeysmom: {
      '#0': { text: '[Placeholder] Where are you? Please call me back.', delay: 1200, next: '#1' },
      '#1': { text: '[Placeholder] You said you would be at the library.', delay: 1600, gather: 'messages:zoeysmom:#1', next: null },
    },
    lily: {
      '#0': { text: '[Placeholder] Did you get home okay?', delay: 1000, next: '#1' },
      '#1': { text: '[Placeholder] Text me when you see this', delay: 1200, next: '#2' },
      '#2': { text: '[Placeholder] The meeting spot is the old bridge.', delay: 1400, gather: 'messages:lily:#2', next: null },
    },
  },
};

/** Pre-existing history shown above the live conversation (oldest first). */
export const fillerchats: Record<PhoneName, Record<string, FillerMessage[]>> = {
  myphone: {
    wife: [
      { type: '-1', text: 'system::Failed to load older messages', time: '2023-01-12T08:00:00' },
      { type: '-1', text: 'system::12th January, 2023', time: '2023-01-12T08:00:00' },
      { type: '0', text: '[Placeholder] Morning!', time: '2023-01-12T08:23:00' },
      { type: '1', text: '[Placeholder] Morning. Running late.', time: '2023-01-12T08:30:00' },
      { type: '0', text: '[Placeholder] Dinner at 8?', time: '2023-01-12T12:10:00' },
    ],
    colleague: [
      { type: '-1', text: 'system::11th January, 2023', time: '2023-01-11T18:00:00' },
      { type: '1', text: '[Placeholder] Report is on your desk.', time: '2023-01-11T18:02:00' },
      { type: '0', text: '[Placeholder] Thanks!', time: '2023-01-11T18:05:00' },
    ],
  },
  herphone: {
    zoeysmom: [
      { type: '-1', text: 'system::22nd December, 2022', time: '2022-12-22T19:00:00' },
      { type: '0', text: '[Placeholder] Dinner is ready', time: '2022-12-22T19:00:00' },
      { type: '1', text: '[Placeholder] Coming!', time: '2022-12-22T19:02:00' },
    ],
    zoeysdad: [
      { type: '-1', text: 'system::21st December, 2022', time: '2022-12-21T10:00:00' },
      { type: '0', text: '[Placeholder] Picking you up at 5.', time: '2022-12-21T10:00:00' },
      { type: '1', text: '[Placeholder] Okay dad', time: '2022-12-21T10:15:00' },
    ],
    lily: [
      { type: '-1', text: 'system::22nd December, 2022', time: '2022-12-22T21:00:00' },
      { type: '0', text: '[Placeholder] Are you coming tomorrow?', time: '2022-12-22T21:00:00' },
      { type: '1', text: '[Placeholder] Yes!! See you there', time: '2022-12-22T21:04:00' },
      { type: '0', text: 'image::zoeylocker', time: '2022-12-22T21:05:00' },
    ],
    besties: [
      { type: '-1', text: 'system::Failed to load older messages', time: '2022-12-23T00:00:00' },
      { type: '-1', text: 'system::23rd December, 2022', time: '2022-12-23T00:00:00' },
      { type: '0', text: '[Placeholder] Hey guys! Not coming today', time: '2022-12-23T09:32:00', sender: 'betty' },
      { type: '0', text: '[Placeholder] Woah... surprising!!!', time: '2022-12-23T09:33:00', sender: 'kyle' },
      { type: '1', text: '[Placeholder] See you tonight then', time: '2022-12-23T09:40:00' },
    ],
  },
};

/** Profile status lines shown under the chat header. */
export const profiles: Record<string, { status: string }> = {
  wife: { status: '[Placeholder] What a beautiful day it is' },
  colleague: { status: '[Placeholder] Busy' },
  unknown: { status: '' },
  zoeysmom: { status: '[Placeholder] Family first' },
  zoeysdad: { status: '' },
  lily: { status: '[Placeholder] ✨' },
  betty: { status: '' },
  kyle: { status: '' },
};
