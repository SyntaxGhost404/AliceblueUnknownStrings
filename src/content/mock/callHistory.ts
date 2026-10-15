import { PhoneName } from '../types';
import { CallContact } from './callTypes';

// MOCK DATA — placeholder call logs and call-only contacts for the Phone app. The shapes mirror the
// reference build (`{ number, time, type, count? }`); names are looked up from the contacts list.

export type HistoryEntry = {
  number: string;
  /** ISO date-time for the static log, or a story date (DD-MM-YYYY) for calls made in the game. */
  time: string;
  type: 'incoming' | 'outgoing' | 'missed';
  /** Repeated attempts grouped into a single row, shown as "(n)". */
  count?: number;
  name?: string;
  contact?: string;
  caller_id?: string;
};

/** Older calls that are already in the log when the game starts (newest first). */
export const callHistory: Record<PhoneName, HistoryEntry[]> = {
  myphone: [
    { number: '5550102', time: '2023-01-13T18:30:00.000', type: 'outgoing' },
    { number: '5550101', time: '2023-01-13T12:00:00.000', type: 'missed', count: 2 },
    { number: '5550111', time: '2023-01-12T20:00:00.000', type: 'incoming' },
    { number: '5550101', time: '2023-01-12T19:00:00.000', type: 'outgoing' },
    { number: '5550102', time: '2023-01-12T09:00:00.000', type: 'incoming' },
    { number: '5550122', time: '2023-01-11T00:00:00.000', type: 'missed' },
    { number: '5550101', time: '2023-01-10T00:00:00.000', type: 'incoming' },
    { number: '5550102', time: '2023-01-10T00:00:00.000', type: 'outgoing', count: 3 },
    { number: '5550150', time: '2023-01-09T00:00:00.000', type: 'outgoing' },
    { number: '5550101', time: '2023-01-08T23:00:00.000', type: 'missed' },
    { number: '5550111', time: '2023-01-06T23:00:00.000', type: 'incoming' },
    { number: '5550102', time: '2023-01-05T23:00:00.000', type: 'outgoing' },
    { number: '5550101', time: '2023-01-04T23:00:00.000', type: 'incoming' },
    { number: '5550122', time: '2023-01-03T23:00:00.000', type: 'missed', count: 2 },
    { number: '5550102', time: '2023-01-02T23:00:00.000', type: 'incoming' },
    { number: '5550101', time: '2023-01-01T00:00:00.000', type: 'outgoing' },
    { number: '5550150', time: '2022-12-31T00:00:00.000', type: 'outgoing' },
    { number: '5550102', time: '2022-12-30T00:00:00.000', type: 'incoming' },
    { number: '5550101', time: '2022-12-29T00:00:00.000', type: 'missed' },
    { number: '5550111', time: '2022-12-28T00:00:00.000', type: 'incoming' },
  ],
  herphone: [
    { number: '5550201', time: '2023-01-12T00:00:00.000', type: 'missed', count: 2 },
    { number: '5550202', time: '2023-01-12T00:00:00.000', type: 'missed' },
    { number: '5550203', time: '2023-01-11T23:00:00.000', type: 'missed', count: 4 },
    { number: '5550204', time: '2023-01-11T20:00:00.000', type: 'missed' },
    { number: '5550205', time: '2023-01-11T20:00:00.000', type: 'missed', count: 2 },
    { number: '5550201', time: '2023-01-10T23:00:00.000', type: 'missed', count: 6 },
    { number: '5550222', time: '2023-01-10T23:00:00.000', type: 'missed' },
    { number: '5550202', time: '2023-01-10T22:00:00.000', type: 'missed', count: 3 },
    { number: '5550203', time: '2023-01-10T20:00:00.000', type: 'incoming' },
    { number: '5550204', time: '2023-01-10T19:00:00.000', type: 'outgoing' },
    { number: '5550201', time: '2023-01-10T19:00:00.000', type: 'incoming' },
    { number: '5550205', time: '2023-01-10T18:30:00.000', type: 'outgoing' },
    { number: '5550203', time: '2023-01-10T18:30:00.000', type: 'outgoing' },
    { number: '5550222', time: '2023-01-09T00:00:00.000', type: 'incoming' },
    { number: '5550202', time: '2023-01-09T00:00:00.000', type: 'outgoing' },
    { number: '5550201', time: '2023-01-08T00:00:00.000', type: 'incoming' },
    { number: '5550204', time: '2023-01-07T00:00:00.000', type: 'missed' },
    { number: '5550203', time: '2023-01-06T00:00:00.000', type: 'outgoing' },
    { number: '5550205', time: '2023-01-05T00:00:00.000', type: 'incoming' },
    { number: '5550202', time: '2023-01-04T00:00:00.000', type: 'incoming' },
  ],
};

/** Numbers that are not saved contacts but were identified by the phone ("Caller identified: ..."). */
export const callerIds: Record<string, string> = {
  '5550111': '[Placeholder] Delivery Service',
  '5550122': '[Placeholder] Clinic',
  '5550222': '[Placeholder] Courier',
};

/** Contacts that only exist for calls (a phone menu and a friend), alongside the shared contacts. */
export const callContacts: Record<string, CallContact> = {
  hotline: { name: 'Service Hotline', number: '5550150' },
  friend: { name: 'Friend C', number: '5550160' },
};

/** Calling is not available on these phones (the dial pad shows a notice instead). */
export const callingDisabled: Record<PhoneName, boolean> = { myphone: false, herphone: true };

type SessionPoint = [number, number, number];

/**
 * Story hints inside the log: while the story is within `start`..`end`, the matching row (or its
 * call button) pulses; tapping a row gathers the clue `gather`.
 */
export type HistoryHighlight = {
  id: string;
  start: SessionPoint;
  end?: SessionPoint;
  number: string;
  /** Row to highlight (matched by its `time`); omit to pulse the call button of every row of `number`. */
  time?: string;
  gather?: string;
};

// Placeholder window that the mock story never reaches.
export const historyHighlights: Record<PhoneName, HistoryHighlight[]> = {
  myphone: [
    {
      id: 'placeholder-row',
      start: [99, 0, 0],
      number: '5550102',
      time: '2023-01-13T18:30:00.000',
      gather: 'call:history:placeholder',
    },
    { id: 'placeholder-call', start: [99, 0, 0], number: '5550150' },
  ],
  herphone: [],
};
