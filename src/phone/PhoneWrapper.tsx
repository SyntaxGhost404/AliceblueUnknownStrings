import React, { memo, useContext, useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import CustomImage from '../components/CustomImage';
import { getOther } from '../assets/images';
import { GlobalContext } from '../state/GlobalProvider';
import { ForceNavigation, PhoneName } from '../content/types';
import Phone from './Phone';
import DialogBox, { DialogBoxData } from './DialogBox';

const TAB_INDEX: Record<string, number> = { suspectboard: 0, myphone: 1, herphone: 2 };

/**
 * Hosts a phone over its wallpaper and carries out story-driven navigation
 * ("force navigate"): switch to the right screen, then rebuild that phone's stack so the
 * requested app (and optional inner screen) is open on top of the home screen.
 */
function PhoneWrapper({ name }: { name: PhoneName }) {
  const { jumpTo, dispatch } = useNavigation<any>();
  const { event, forceNavigation, setForceNavigation } = useContext(GlobalContext);
  const [wallpaperAnim] = useState(() => new Animated.Value(1));
  const [dialogBox, setDialogBox] = useState<DialogBoxData>(null);

  const forceNavigate = (nav: ForceNavigation) => {
    jumpTo(nav.screen);
    if (nav.screen === 'suspectboard' || !nav.app) return;
    const tab = TAB_INDEX[nav.screen];
    const appState = nav.appScreen
      ? { index: 1, routes: [{ name: 'home' }, { name: nav.appScreen, params: { ...(nav.data ?? {}) } }] }
      : undefined;
    const phoneState = {
      index: nav.noHomescreen ? 0 : 1,
      routes: [
        ...(nav.noHomescreen ? [] : [{ name: 'homescreen' }]),
        { name: nav.app, ...(appState ? { state: appState } : {}) },
      ],
    };
    dispatch((state: any) => {
      const routes = [...state.routes];
      routes[tab] = { ...routes[tab], state: phoneState };
      return CommonActions.reset({ ...state, routes });
    });
  };

  useEffect(() => {
    if (!event?.forceNavigate) return;
    const t = setTimeout(() => forceNavigate(event.forceNavigate), event.forceNavigate.delay ?? 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  useEffect(() => {
    if (!forceNavigation) return;
    if (forceNavigation.screen === name || (forceNavigation.screen === 'suspectboard' && name === 'myphone')) {
      forceNavigate(forceNavigation);
      setForceNavigation(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceNavigation]);

  return (
    <View style={styles.parentLayout}>
      <Animated.View style={{ width: '100%', height: '100%', position: 'absolute', opacity: wallpaperAnim }}>
        <CustomImage
          width="100%"
          height="100%"
          style={{ position: 'absolute', opacity: 1 }}
          resizeMode="cover"
          source={name === 'herphone' ? getOther('zoeyLockscreen') : getOther('detectiveLockscreen')}
        />
      </Animated.View>
      <Phone phone={name} />
      {dialogBox ? <DialogBox dialogBox={dialogBox} setDialogBox={setDialogBox} /> : null}
    </View>
  );
}

export default memo(PhoneWrapper);

const styles = StyleSheet.create({
  parentLayout: { flex: 1, backgroundColor: '#111' },
});
