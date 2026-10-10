import { Episode } from '../types';

// MOCK DATA — a short placeholder storyline whose only purpose is to exercise every UI
// framework (chats with choices, notifications, desk highlights, phone unlock, clue
// gathering, hints, incoming calls). Replace with real episodes later.
const episodes: Episode[] = [
  {
    title: 'Prologue',
    launch: 'myphone',
    music: false,
    objectives: [
      {
        title: 'Talk to your colleague',
        description: '[Placeholder] Reply to the message on your phone.',
        date: '13-01-2023',
        time: '09:40 PM',
        hints: [
          '[Placeholder] Open the Messages app on your phone.',
          '[Placeholder] Reply to your colleague.',
          '[Placeholder] Any reply moves the story forward.',
        ],
        checkpoints: [
          {
            title: 'Talk to your colleague',
            launch: 'myphone',
            action: {
              app: 'messages',
              device: 'myphone',
              chatName: 'colleague',
              id: '#0',
              delay: 1500,
              action: { app: 'online', users: ['colleague'], delay: 0 },
            },
          },
        ],
      },
      {
        title: 'Check the box on your desk',
        description: '[Placeholder] Something has arrived at the office.',
        date: '13-01-2023',
        time: '09:44 PM',
        hints: [
          '[Placeholder] Swipe to the desk.',
          '[Placeholder] Tap the glowing box.',
          '[Placeholder] Pick up the phone inside.',
        ],
        checkpoints: [
          {
            title: 'Check the box on your desk',
            launch: 'myphone',
            action: { app: 'highlight', screen: 'suspectboard', object: 'evidencebox', noti: 'box_arrived', delay: 800 },
          },
        ],
      },
    ],
  },
  {
    title: 'Placeholder Title',
    launch: 'myphone',
    music: true,
    objectives: [
      {
        title: "Unlock Zoey's phone",
        description: "[Placeholder] Find Zoey's password from the items on your desk.",
        date: '13-01-2023',
        time: '09:52 PM',
        hints: [
          '[Placeholder] Look closely at the photo frame on the desk.',
          '[Placeholder] The note in the box has five numbers.',
          '[Placeholder] The passcode is 12345.',
        ],
        checkpoints: [
          {
            title: "Unlock Zoey's phone",
            launch: 'herphone',
            action: {
              app: 'notification',
              device: 'herphone',
              delay: 1200,
              notification: {
                id: 'call',
                app: 'call',
                screen: 'call',
                title: 'missed_calls_12',
                subtitle: 'missed_family_calls',
                badge: 1,
              },
            },
          },
        ],
      },
      {
        title: "Look through Zoey's phone",
        description: '[Placeholder] Collect clues from her conversations.',
        date: '13-01-2023',
        time: '10:05 PM',
        hints: [
          "[Placeholder] Read Mom's messages.",
          '[Placeholder] Tap the blinking messages to note them down.',
          '[Placeholder] Two clues are hidden in the chats.',
        ],
        checkpoints: [
          {
            title: "Look through Zoey's phone",
            launch: 'herphone',
            swipeHelp: true,
            gather: {
              infos: [
                { id: 'messages:zoeysmom:#1', text: '[Placeholder] Clue one' },
                { id: 'messages:lily:#2', text: '[Placeholder] Clue two' },
              ],
              action: { app: 'checkpoint', delay: 1200 },
            },
            action: {
              app: 'messages',
              device: 'herphone',
              chatName: 'zoeysmom',
              id: '#0',
              delay: 1500,
              action: { app: 'messages', device: 'herphone', chatName: 'lily', id: '#0', delay: 2500 },
            },
          },
          {
            title: 'Report to your colleague',
            launch: 'myphone',
            action: {
              app: 'call',
              device: 'myphone',
              caller: 'colleague',
              delay: 2000,
              retry: true,
            },
          },
        ],
      },
    ],
  },
];

export default episodes;
