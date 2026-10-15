import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import theme from '../../theme/theme';
import { createAnimation } from '../../theme/animation';
import { GlobalContext } from '../../state/GlobalProvider';
import { isActiveInSession } from '../../content';
import { callHistory, callingDisabled, historyHighlights } from '../../content/mock/callHistory';
import { DATE_DISPLAY_FORMAT, TIME_FORMAT } from '../../utils/date';
import { CallContext, findCallContact, getCallNumber } from '../../phone/call/CallProvider';
import { AppProps } from '../types';
import Header from './Header';
import Dial from './Dial';
import History, { HistoryItem } from './History';

/**
 * Phone app: the call log (newest first, with the older log behind it) and the dial pad. The two
 * swap from the header; a call in progress keeps the dial screen up.
 */
export default function Call({ phone, navigation, route, setNotiBarColor }: AppProps) {
  const { appsData, session, date, time, handleGatherInfo } = useContext(GlobalContext);
  const { ongoing, mode, startCall } = useContext(CallContext);
  const [showDial, setShowDial] = useState<boolean>(!!route?.params?.incoming);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [pulse] = useState(() => new Animated.Value(1));
  const records = appsData[phone].call;

  useFocusEffect(
    useCallback(() => {
      setNotiBarColor((theme as any)[phone].call.colors.notificationBar);
    }, [phone, setNotiBarColor]),
  );

  // A call on screen (or one the player came back to) shows the dial screen.
  useEffect(() => {
    if (ongoing && mode !== 'floating') setShowDial(true);
  }, [ongoing, mode]);

  const history = useMemo<HistoryItem[]>(
    () =>
      [...records, ...callHistory[phone]].map((item, index) => ({
        ...item,
        transformedId: `${item.name}-${item.time}-${index}`,
      })),
    [records, phone],
  );

  // Story hint: a row (or call button) pulses while the story is inside its window.
  const highlight = useMemo(
    () => historyHighlights[phone].find(h => h.id !== dismissed && isActiveInSession(session, h.start, h.end)) ?? null,
    [phone, session, dismissed],
  );

  useEffect(() => {
    if (!highlight || showDial) return;
    const loop = Animated.loop(
      Animated.sequence([
        createAnimation(pulse, 0.1, 600, Easing.linear),
        createAnimation(pulse, 1, 600, Easing.linear),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      pulse.setValue(1);
    };
  }, [highlight, showDial, pulse]);

  const now = useMemo(
    () => moment.utc(`${date} ${time}`, `${DATE_DISPLAY_FORMAT} ${TIME_FORMAT}`),
    [date, time],
  );

  const handleCall = (item: HistoryItem) => {
    if (ongoing) return;
    const number = item.number || getCallNumber(item.contact ?? findCallContact(item.number ?? ''));
    if (number && !callingDisabled[phone]) startCall(number, 'outgoing');
    setShowDial(true);
  };

  const onHighlightPress = () => {
    if (!highlight) return;
    if (highlight.gather) handleGatherInfo(highlight.gather);
    setDismissed(highlight.id);
    setShowDial(false);
  };

  return (
    <View style={[styles.parentLayout, { backgroundColor: (theme as any)[phone].call.colors.background }]}>
      <Header
        navigation={navigation}
        phone={phone}
        showDial={showDial}
        setShowDial={setShowDial}
        onCall={!!ongoing}
      />
      {showDial ? (
        <Dial phone={phone} navigation={navigation} />
      ) : (
        <History
          history={history}
          now={now}
          highlight={highlight}
          pulse={pulse}
          onCall={handleCall}
          onHighlightPress={onHighlightPress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, flexDirection: 'column' },
});
