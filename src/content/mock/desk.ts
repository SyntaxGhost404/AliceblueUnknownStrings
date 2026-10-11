import { GameAction } from '../types';

// MOCK DATA — placement of the objects on Adam's desk and board. Coordinates are percentages
// of the screen, matching the reference layout. `start`/`end` are [episode, objective,
// checkpoint] windows during which an object is shown.

type Point = [number, number, number];

export type DeskObject = {
  name: string;
  x: string;
  y: string;
  width: string;
  aspectRatio: number;
  start?: Point;
  end?: Point;
  /** Evidence-box contents, revealed one at a time. */
  items?: string[];
  /** Fired once the last item has been taken out of a box. */
  onEmpty?: GameAction;
};

export const deskObjects: DeskObject[] = [
  { name: 'paper1', x: '93%', y: '80%', width: '27%', aspectRatio: 1.39, start: [0, 0, 0] },
  { name: 'paper2', x: '-3%', y: '97%', width: '28%', aspectRatio: 1.47, start: [0, 0, 0] },
  { name: 'paper3', x: '33%', y: '97.5%', width: '22%', aspectRatio: 1.535, start: [0, 0, 0] },
  { name: 'paperball1', x: '11%', y: '80%', width: '9%', aspectRatio: 1, start: [0, 0, 0] },
  { name: 'paperball2', x: '89.5%', y: '82%', width: '8%', aspectRatio: 1.17, start: [0, 0, 0] },
  { name: 'paperball3', x: '23%', y: '97.5%', width: '8%', aspectRatio: 1.33, start: [0, 0, 0] },
  { name: 'penholder', x: '1%', y: '73%', width: '15%', aspectRatio: 0.55, start: [0, 0, 0] },
  { name: 'photoframe', x: '16%', y: '76.5%', width: '15%', aspectRatio: 0.84, start: [0, 0, 0] },
  { name: 'myphone', x: '5%', y: '91.5%', width: '15%', aspectRatio: 1.41, start: [0, 0, 0] },
  { name: 'casereport', x: '25%', y: '82%', width: '24%', aspectRatio: 1.41, start: [1, 0, 0] },
  {
    name: 'evidencebox',
    x: '56%',
    y: '83%',
    width: '40%',
    aspectRatio: 1.36,
    start: [0, 1, 0],
    end: [0, 1, 0],
    items: ['casereport', 'family', 'studentid', 'zoey'],
    onEmpty: { app: 'overlay', overlay: 'prologueEnd', delay: 1200 },
  },
  { name: 'herphone', x: '77%', y: '91%', width: '16.5%', aspectRatio: 1.37, start: [1, 0, 0] },
  { name: 'family', x: '35%', y: '5%', width: '23%', aspectRatio: 0.88, start: [1, 0, 0] },
  { name: 'studentid', x: '6%', y: '7%', width: '23%', aspectRatio: 0.88, start: [1, 0, 0] },
  { name: 'zoey', x: '34.5%', y: '37%', width: '27%', aspectRatio: 0.88, start: [1, 0, 0] },
  { name: 'unknown', x: '4%', y: '59%', width: '23%', aspectRatio: 0.88, start: [1, 0, 0] },
  { name: 'lily', x: '64.5%', y: '7.5%', width: '23%', aspectRatio: 0.88, start: [1, 1, 0] },
  { name: 'betty', x: '75%', y: '33%', width: '23%', aspectRatio: 0.88, start: [1, 1, 0] },
];

/** Objects that open full size when tapped. */
export const deskViewable = ['casereport', 'family', 'studentid', 'zoey', 'unknown', 'lily', 'betty'];

/** Desk clutter (non-interactive). */
export const deskMess = ['stapler', 'penholder', 'paper1', 'paper2', 'paper3', 'paperball1', 'paperball2', 'paperball3'];

export type Marking = {
  text: string;
  x: string;
  y: string;
  /** Offset down a board photo, in % of a photo's height. */
  p?: number;
  rotate: string;
  variant?: 'text' | 'subtext' | 'caption';
  color?: string;
  start?: Point;
  end?: Point;
};

/** Red string between two pinned photos: m* is the start pin, q* the end pin. */
export type BoardLine = {
  m1: number;
  m2: number;
  mw: number;
  mar: number;
  mp: number;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  qw: number;
  qar: number;
  qp: number;
  dash?: boolean;
  color?: string;
  start?: Point;
  end?: Point;
};

export const markings: Marking[] = [
  { text: '[?]', x: '7.5%', y: '55.5%', rotate: '-4deg', start: [1, 0, 0] },
  { text: 'who?', x: '15%', y: '70%', rotate: '-10deg', color: '#EB4A4A', start: [1, 0, 0] },
  { variant: 'subtext', text: 'friend?', x: '67%', y: '33%', p: 92, rotate: '4deg', start: [1, 1, 0] },
];

export const boardLines: BoardLine[] = [
  { m1: 56, m2: 5, mw: 23, mar: 0.88, mp: 92, q1: 60, q2: 34, q3: 48, q4: 37, qw: 27, qar: 0.88, qp: 4, start: [1, 0, 0] },
  { m1: 24, m2: 7.5, mw: 23, mar: 0.88, mp: 92, q1: 24, q2: 32, q3: 48, q4: 37, qw: 27, qar: 0.88, qp: 4, start: [1, 0, 0] },
  { m1: 74, m2: 7.5, mw: 23, mar: 0.88, mp: 92, q1: 66, q2: 32, q3: 48, q4: 37, qw: 27, qar: 0.88, qp: 4, start: [1, 1, 0] },
];

export const dontForget = {
  title: "Don't forget",
  list: [
    { text: 'Groceries', done: true },
    { text: 'Dentist appointment', done: false },
    { text: 'Call the repair guy', done: true },
    { text: '[Placeholder] Case notes', done: false },
  ],
};
