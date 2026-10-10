import { Screen } from '../content/types';

/** Where a launch should land: a game tab, or a pre-game screen such as `episode`. */
export type LaunchTarget = Screen | 'episode' | 'title' | 'login';

export type MainStackParamList = {
  splash: undefined;
  login: undefined;
  title: { nextScreen: LaunchTarget };
  episode: undefined;
  game: { screen: Screen };
};

export const isGameScreen = (screen: string | null | undefined): screen is Screen =>
  screen === 'myphone' || screen === 'herphone' || screen === 'suspectboard';
