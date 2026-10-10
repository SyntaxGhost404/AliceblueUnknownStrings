import moment from 'moment';

// Story dates/times use the same formats as the reference build.
export const TIME_FORMAT = 'hh:mm A';
export const DATE_FORMAT = 'DD-MM-YYYY';
export const DATE_DISPLAY_FORMAT = 'MMMM DD, YYYY';

/** Formats a story date (DD-MM-YYYY or any moment-parsable value) for display. */
export function getDate(value: string) {
  const strict = moment(value, DATE_FORMAT, true);
  return (strict.isValid() ? strict : moment(value || undefined)).format(DATE_DISPLAY_FORMAT);
}

/**
 * Returns the formatted clock value plus the next minute and the ms until it, so the
 * in-game clock can start at a story time and then tick in real time.
 */
export function getTime(value: string) {
  const strict = moment(value, TIME_FORMAT, true);
  const now = strict.isValid() ? strict : moment(value || undefined);
  const later = moment(now).add(1, 'minutes').startOf('minute');
  return { now: now.format(TIME_FORMAT), later: later.format(TIME_FORMAT), diff: later.diff(now) || 60000 };
}

export function getSecondsForCaption(value?: string) {
  const [h, m, s] = (value ? value.split(':') : ['0', '0', '0']).map(parseFloat);
  return h * 3600 + m * 60 + s;
}
