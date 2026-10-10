import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Dimensions, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video from 'react-native-video';
import assets from '../assets';
import { GlobalContext } from '../state/GlobalProvider';
import { createAnimation, playAnimation } from '../theme/animation';
import { createSound, GameSound, playSound } from '../audio/sound';
import { PhoneName } from '../content/types';
import NotificationBar from './NotificationBar';
import NotificationPanel from './NotificationPanel';
import Notification from './Notification';
import PhoneNavigation from './PhoneNavigation';
import PassLock from './PassLock';
import FloatingCall from './call/FloatingCall';
import { CallContext } from './call/CallProvider';

const { height: SCREEN_H } = Dimensions.get('screen');

let ringtone: GameSound | null = null;

/**
 * A phone: status bar, its own navigator (lock screen, home screen, apps), the pop-up
 * notification banner, the pull-down shade with its dimming backdrop, the passcode
 * overlay and the "screen off" cover shown while it boots.
 */
export default function Phone({ phone }: { phone: PhoneName }) {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { session, popupNotification, hint, locked, soundsEnabled, triggerAction } = useContext(GlobalContext);
  const { ongoing, mode } = useContext(CallContext);

  const [panelAnim] = useState(() => new Animated.Value(0));
  const [popupAnim] = useState(() => new Animated.Value(0));
  const [panelHeight, setPanelHeight] = useState(0);
  const panelHeightRef = useRef(panelHeight);
  panelHeightRef.current = panelHeight;
  const [showPanel, setShowPanel] = useState(false);
  const [phoneOff, setPhoneOff] = useState(true);
  const [notiBarColor, setNotiBarColor] = useState('black');
  const [disableNotiBar, setDisableNotiBar] = useState(false);
  const [removeNotiBar, setRemoveNotiBar] = useState(false);
  const [showPasslock, setShowPasslock] = useState(false);
  const [isLockscreen, setIsLockscreen] = useState(false);
  const [glitch, setGlitch] = useState(0);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupAnimation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => {
      subscription.remove();
      ringtone?.stop();
      ringtone?.release();
      ringtone = null;
    };
  }, []);

  // The screen wakes shortly after the game opens.
  useEffect(() => {
    if (!session) return;
    const wake = setTimeout(() => setPhoneOff(false), 300);
    return () => clearTimeout(wake);
  }, [session, phone]);

  // Pop-up banner: slides down, rings for calls, retracts after a few seconds otherwise.
  const popup = popupNotification[phone];
  useEffect(() => {
    if (!popup) {
      popupAnim.setValue(0);
      ringtone?.stop();
      ringtone?.release();
      ringtone = null;
      return;
    }
    if (popup.type === 'call' && soundsEnabled) {
      ringtone?.release();
      ringtone = createSound('ringtone.mp3', s => {
        if (s === 'error') return;
        s.setVolume(0.4);
        s.setNumberOfLoops(-1);
        s.play();
      });
    }
    if (popupTimer.current) clearTimeout(popupTimer.current);
    popupAnimation.current?.stop();
    popupAnimation.current = createAnimation(popupAnim, popup.type === 'call' ? SCREEN_H / 4 : SCREEN_H / 5.1, 250);
    popupAnimation.current.start();
    if (popup.type !== 'call') {
      popupTimer.current = setTimeout(() => {
        popupAnimation.current = playAnimation(popupAnim, 0, 250);
      }, 3500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popup, phone]);

  const closePanel = () => {
    playAnimation(panelAnim, 0, 200);
    setTimeout(() => setShowPanel(false), 200);
  };

  const handlePanel = () => {
    setShowPanel(true);
    playAnimation(panelAnim, panelHeightRef.current, 200);
  };

  // A freshly unlocked hint is shown by opening the shade.
  useEffect(() => {
    if (hint > 0 && isFocused) {
      const open = setTimeout(handlePanel, 1000);
      return () => clearTimeout(open);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hint]);

  const hidePopup = () => {
    if (popupTimer.current) clearTimeout(popupTimer.current);
    playAnimation(popupAnim, 0, 300);
  };

  const onPanelLayout = (e: LayoutChangeEvent) => {
    const top = insets.top;
    setPanelHeight(e.nativeEvent.layout.height + top - (top > 0 ? 5 : 0));
  };

  return (
    <View style={[styles.parentLayout, { backgroundColor: showPasslock ? '#00000055' : 'transparent' }]}>
      {glitch !== 0 ? (
        <View style={styles.glitch}>
          <Video
            onEnd={() => setGlitch(1)}
            onError={e => console.log(e)}
            resizeMode="cover"
            source={assets.videos.glitch}
            style={[StyleSheet.absoluteFill, { opacity: glitch === 1 ? 0 : 1 }]}
          />
        </View>
      ) : null}
      {!removeNotiBar ? (
        <NotificationBar
          onPanelDownPress={handlePanel}
          showPasslock={showPasslock}
          phone={phone}
          notiBarColor={notiBarColor}
          isLockscreen={isLockscreen}
          disableNotiBar={disableNotiBar}
        />
      ) : null}
      <PhoneNavigation
        phone={phone}
        handlePanel={handlePanel}
        setPhoneOff={setPhoneOff}
        topInset={insets.top}
        showPasslock={showPasslock}
        setShowPasslock={setShowPasslock}
        setNotiBarColor={setNotiBarColor}
        setIsLockscreen={setIsLockscreen}
        disableNotiBar={disableNotiBar}
        setDisableNotiBar={setDisableNotiBar}
        setRemoveNotiBar={setRemoveNotiBar}
        setGlitch={setGlitch}
      />
      {!locked?.[phone] && popup && popup.id !== 'objective' ? (
        <Animated.View style={[styles.popupNotification, { bottom: SCREEN_H, transform: [{ translateY: popupAnim }] }]}>
          <Notification
            phone={phone}
            onAction={action => {
              hidePopup();
              triggerAction(action);
            }}
            navigate={(screen, params) => {
              hidePopup();
              if (popup.app === 'suspectboard') navigation.navigate('suspectboard');
              else navigation.navigate(phone, { screen, params });
            }}
            notiBGColor="#111"
            hideHint
            type={popup.type}
            app={popup.app}
            screen={popup.screen}
            url={popup.url}
            action={popup.action}
            chatName={popup.chatName}
            caller={popup.caller}
            retry={popup.retry}
            data={popup.data}
            title={popup.title}
            subtitle={popup.subtitle}
            date={popup.date}
            badge={popup.badge}
          />
        </Animated.View>
      ) : null}
      {showPanel ? (
        <Animated.View
          onTouchStart={() => {
            closePanel();
            if (soundsEnabled) playSound('button.mp3');
          }}
          style={[
            styles.phoneFade,
            {
              opacity: panelAnim.interpolate({
                inputRange: [0, Math.max(1, panelHeight / 4), Math.max(2, panelHeight)],
                outputRange: [0, 0.7, 1],
              }),
            },
          ]}
        />
      ) : null}
      <Animated.View
        onLayout={onPanelLayout}
        style={[styles.notificationPanel, { bottom: SCREEN_H, transform: [{ translateY: panelAnim }] }]}>
        <NotificationPanel phone={phone} closePanel={closePanel} setNotiBarColor={setNotiBarColor} />
      </Animated.View>
      {ongoing && mode === 'floating' ? <FloatingCall phone={phone} /> : null}
      {showPasslock ? <PassLock phone={phone} setShowPasslock={setShowPasslock} /> : null}
      {phoneOff ? <View style={styles.phoneoff} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, backgroundColor: 'transparent' },
  glitch: { ...StyleSheet.absoluteFill, backgroundColor: '#020810' },
  phoneFade: { ...StyleSheet.absoluteFill, backgroundColor: '#090909', zIndex: 499 },
  phoneoff: { ...StyleSheet.absoluteFill, backgroundColor: '#070A0C', zIndex: 699 },
  notificationPanel: { width: '100%', position: 'absolute', zIndex: 599 },
  popupNotification: { width: '100%', padding: '2%', position: 'absolute', zIndex: 399 },
});
