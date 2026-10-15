import type { GameAction } from '../types';
import type assets from '../../assets';

type SessionPoint = [number, number, number];

// MOCK DATA — placeholder content for Pixabowl, the fictional social network on Zoey's phone.
// The pictures are the reference build's post/profile images used as stand-ins; every handle,
// caption, comment, password and security answer below is a neutral placeholder.

export type PixabowlKey = keyof typeof assets.pixabowl;

export type PixabowlUser = {
  /** Handle shown on posts and comments. */
  name: string;
  full_name: string;
  followers: string;
  following: string;
  bio: string;
  /** Key of the avatar in src/assets/pixabowl. */
  avatar: PixabowlKey;
};

export type PixabowlComment = { user: string; content: string };

export type PixabowlPost = {
  /** Neutral id; clue ids for the story are `pixabowl:<id>`. */
  id: string;
  /** Key of `pixabowlUsers`. */
  user: string;
  /** Key of the picture in src/assets/pixabowl. */
  image: PixabowlKey;
  likes: number;
  caption: string;
  topComments: PixabowlComment[];
  /** Release time (ISO); the post shows once the in-game clock has passed it. */
  time: string;
  start?: SessionPoint;
  end?: SessionPoint;
};

/** The player's own account (the avatar in the header opens its profile). */
export const SELF_USER = 'zoey';

export const pixabowlUsers: Record<string, PixabowlUser> = {
  zoey: {
    name: 'zoey.mock',
    full_name: 'Zoey Placeholder',
    followers: '718',
    following: '710',
    bio: '[Placeholder] A short bio for the player account.',
    avatar: 'profile-zoey',
  },
  alex: {
    name: 'alex.mock',
    full_name: 'Alex Placeholder',
    followers: '37.3K',
    following: '417',
    bio: '[Placeholder] Bio line one.\n[Placeholder] Bio line two.',
    avatar: 'profile-betty',
  },
  blake: {
    name: 'blake_mock',
    full_name: 'Blake Placeholder',
    followers: '1044',
    following: '788',
    bio: '[Placeholder] A bio for another account.',
    avatar: 'profile-brad',
  },
  casey: {
    name: 'casey.mock',
    full_name: 'Casey Placeholder',
    followers: '214',
    following: '457',
    bio: '[Placeholder] Casey bio.',
    avatar: 'profile-bud24',
  },
  dana: {
    name: 'dana.mock',
    full_name: 'Dana Placeholder',
    followers: '66',
    following: '101',
    bio: '[Placeholder] Dana bio.',
    avatar: 'profile-kevin',
  },
  eli: {
    name: 'eli_mock',
    full_name: 'Eli Placeholder',
    followers: '1202',
    following: '601',
    bio: '[Placeholder] Eli bio.',
    avatar: 'profile-kyle',
  },
  fern: {
    name: 'fern.mock',
    full_name: 'Fern Placeholder',
    followers: '895',
    following: '955',
    bio: '[Placeholder] Fern bio.',
    avatar: 'profile-melanie',
  },
  gus: {
    name: 'gus_mock',
    full_name: 'Gus Placeholder',
    followers: '908',
    following: '333',
    bio: '[Placeholder] Gus bio.',
    avatar: 'profile-mike',
  },
  hale: {
    name: 'hale.mock',
    full_name: 'Hale Placeholder',
    followers: '212',
    following: '90',
    bio: '[Placeholder] Hale bio.',
    avatar: 'profile-shane',
  },
  ivy: {
    name: 'ivy.mock',
    full_name: 'Ivy Placeholder',
    followers: '54.3K',
    following: '42',
    bio: '[Placeholder] A creator account bio.',
    avatar: 'profile-techyonic',
  },
  jude: {
    name: 'jude_mock',
    full_name: 'Jude Placeholder',
    followers: '387',
    following: '298',
    bio: '[Placeholder] Jude bio.',
    avatar: 'profile-victoriiu',
  },
  kit: {
    name: 'kit.mock',
    full_name: 'Kit Placeholder',
    followers: '502',
    following: '204',
    bio: '[Placeholder] Kit bio.',
    avatar: 'profile-zac',
  },
};

const post = (
  id: string,
  user: string,
  image: PixabowlKey,
  likes: number,
  comments: PixabowlComment[],
  extra: Partial<PixabowlPost> = {},
): PixabowlPost => ({
  id,
  user,
  image,
  likes,
  caption: `[Placeholder] Caption for ${id}.`,
  topComments: comments,
  time: '2023-01-05T00:00:00.000',
  ...extra,
});

export const pixabowlPosts: PixabowlPost[] = [
  post('post1', 'alex', 'post-betty-sunglasses', 6300, [
    { user: 'eli', content: '[Placeholder] First comment.' },
    { user: 'casey', content: '[Placeholder] A second comment that is a little longer, to check how it wraps.' },
  ]),
  post('post2', 'ivy', 'post-techyonic-fan-art-poster', 63000, [
    { user: 'alex', content: '[Placeholder] Nice one.' },
    { user: 'eli', content: '[Placeholder] Another comment.' },
  ]),
  post('post3', 'blake', 'post-brad-gymbro', 1301, [
    { user: 'alex', content: '[Placeholder] Comment A.' },
    { user: 'eli', content: '[Placeholder] Comment B.' },
    { user: 'alex', content: '[Placeholder] Comment C.' },
  ]),
  post('post4', 'alex', 'post-betty-bed-coffee', 1989, [
    { user: 'eli', content: '[Placeholder] Comment.' },
    { user: 'casey', content: '[Placeholder] Another one.' },
    { user: 'gus', content: '[Placeholder] And a third.' },
  ]),
  post('post5', 'zoey', 'post-zoey-beach', 204, [{ user: 'alex', content: '[Placeholder] Looks great.' }]),
  post('post6', 'eli', 'post-kyle-cartons', 872, [{ user: 'fern', content: '[Placeholder] Comment.' }]),
  post('post7', 'ivy', 'post-game-promo3', 38700, [
    { user: 'jude', content: '[Placeholder] Comment on a promo post.' },
    { user: 'hale', content: '[Placeholder] Comment two.' },
  ]),
  post('post8', 'alex', 'post-betty-nails', 5301, [
    { user: 'eli', content: '[Placeholder] Comment.' },
    { user: 'casey', content: '[Placeholder] Another comment.' },
  ]),
  post('post9', 'gus', 'post-bicycle', 412, []),
  post('post10', 'zoey', 'post-zoey-lily', 640, [
    { user: 'alex', content: '[Placeholder] Comment.' },
    { user: 'kit', content: '[Placeholder] Another comment.' },
  ]),
  post('post11', 'jude', 'post-party-blue', 322, [{ user: 'kit', content: '[Placeholder] Comment.' }]),
  post('post12', 'alex', 'post-betty-wine', 10201, [
    { user: 'eli', content: '[Placeholder] Comment.' },
    { user: 'gus', content: '[Placeholder] Comment.' },
  ]),
  // These two only show once the story reaches the second objective of episode 1.
  post('post13', 'kit', 'post-zoey-zac', 530, [{ user: 'zoey', content: '[Placeholder] A late comment.' }], {
    start: [1, 1, 0],
  }),
  post('post14', 'hale', 'post-meme-tbrpg', 212, [{ user: 'casey', content: '[Placeholder] Comment.' }], {
    start: [1, 1, 0],
  }),
];

/** Every post by id, for the profile grid and deep links. */
export const findPixabowlPost = (id: string | undefined) => pixabowlPosts.find(p => p.id === id);

// Interface copy the shared string table doesn't have.
export const pixabowlStrings = {
  followers: 'Followers',
  following: 'Following',
  no_posts: 'There are no posts yet',
  incorrect_answer: 'Incorrect answer',
};

/** Placeholder credentials for the login flow. */
export const PIXABOWL_LOGIN = {
  /** Shown (read-only) in the username field. */
  username: 'zoey.mock',
  password: 'mockpass1',
  /** Answer to the security question, compared case-insensitively. */
  answer: 'mockpet',
  /** From this story point on, the app opens straight on the feed. */
  openFrom: [2, 0, 0] as SessionPoint,
  /** Story action fired when the player gets in (undefined in the mock story). */
  onLogin: undefined as GameAction | undefined,
};
