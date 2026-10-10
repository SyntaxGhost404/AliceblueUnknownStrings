import { PhoneName } from '../content/types';

/** Props every phone app receives from the phone navigator. */
export type AppProps = {
  phone: PhoneName;
  navigation: any;
  route: any;
  setNotiBarColor: (color: string) => void;
  disableNotiBar?: boolean;
  setDisableNotiBar: (v: boolean) => void;
  setRemoveNotiBar: (v: boolean) => void;
  setGlitch: (v: number) => void;
};
