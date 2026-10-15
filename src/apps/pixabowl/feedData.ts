import moment from 'moment';
import { isActiveInSession } from '../../content';
import { PixabowlPost, pixabowlPosts, pixabowlUsers } from '../../content/mock/pixabowl';
import { Session } from '../../content/types';
import { DATE_DISPLAY_FORMAT, TIME_FORMAT } from '../../utils/date';
import { getAppImage } from '../../assets/images';

/** Per-app persisted state (`appsData[phone].apps.pixabowl`). */
export type PixabowlState = {
  /** The player got past the login screen. */
  loggedIn?: boolean;
  /** Posts the player liked, by post id. */
  liked?: Record<string, boolean>;
};

/** Posts on the feed now: released by the in-game clock and inside their story window. */
export function getFeed(session: Session | null, date: string, time: string): PixabowlPost[] {
  const now = moment.utc(`${date} ${time}`, `${DATE_DISPLAY_FORMAT} ${TIME_FORMAT}`);
  return pixabowlPosts.filter(
    post => moment.utc(post.time).isBefore(now) && isActiveInSession(session, post.start, post.end),
  );
}

export const getUser = (id: string) => pixabowlUsers[id];

export const getAvatar = (id: string) => {
  const user = pixabowlUsers[id];
  return user ? getAppImage('pixabowl', user.avatar) : undefined;
};
