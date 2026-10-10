import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import SmartText from '../../components/SmartText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { playAnimation } from '../../theme/animation';
import { getAppImage } from '../../assets/images';
import { chatKey, GlobalContext } from '../../state/GlobalProvider';
import { getProfileName } from '../../content';
import contacts from '../../content/mock/contacts';
import { PhoneName } from '../../content/types';
import Header from './Header';
import MessageList from './MessageList';
import Profile from './Profile';
import ImageView from './ImageView';
import { ImageViewData } from './MessageImage';
import { getHistory, groupPresence, presenceStatus, typingStatus } from './chatData';

// Option buttons share the reply area: one fills it, two or three split it.
const OPTION_HEIGHTS = ['88%', '46%', '31%'] as const;

type Props = { phone: PhoneName; route: any; navigation: any; setNotiBarColor: (c: string) => void };

/**
 * A conversation: history and live messages, the typing bubble, and below a divider either
 * the contact's presence line or the reply options waiting for the player.
 */
export default function Chat({ phone, route, setNotiBarColor }: Props) {
  const insets = useSafeAreaInsets();
  const chatName: string = route.params?.chatName ?? route.params?.person;
  const { appsData, chat, chooseOption, setChatFocused, usersOnline } = useContext(GlobalContext);
  const [showProfile, setShowProfile] = useState(false);
  const [imageView, setImageView] = useState<ImageViewData | null>(null);
  const [optionsAnim] = useState(() => new Animated.Value(0));
  const colors = (theme as any)[phone].messages.colors.chat;
  const group = contacts[chatName]?.group;
  const key = chatKey(phone, chatName);
  const typer = chat.typing[key];
  const options = chat.options[key]?.options ?? [];

  useFocusEffect(
    useCallback(() => {
      setChatFocused(phone, chatName);
      return () => setChatFocused(null);
    }, [phone, chatName, setChatFocused]),
  );

  useEffect(() => {
    optionsAnim.setValue(0);
    playAnimation(optionsAnim, 1, 250);
  }, [options.length, optionsAnim]);

  const messages = useMemo(() => {
    const all = [...getHistory(phone, chatName), ...(appsData[phone].messages[chatName] ?? [])].reverse();
    return typer ? [{ transformedId: 'typing' as const }, ...all] : all;
  }, [phone, chatName, appsData, typer]);

  let status: string;
  if (typer) status = typingStatus(getProfileName(typer));
  else if (group) status = groupPresence(group.members.filter(m => usersOnline.includes(m)).map(m => getProfileName(m)));
  else status = presenceStatus(getProfileName(chatName), usersOnline.includes(chatName));

  return (
    <View style={[styles.parentLayout, { paddingBottom: insets.bottom }]}>
      <Header phone={phone} chatName={chatName} setNotiBarColor={setNotiBarColor} onTitleClick={() => setShowProfile(true)} />
      <MessageList chatName={chatName} messages={messages as any} typer={typer} group={!!group} setImageView={setImageView} />
      <View style={[styles.divider, { backgroundColor: colors.optionBorder }]} />
      <Animated.View onStartShouldSetResponder={() => true} style={[styles.optionsWrapper, { opacity: optionsAnim }]}>
        {options.length === 0 ? (
          <View style={styles.options}>
            <SmartText color={colors.status} text={status} />
          </View>
        ) : (
          <View style={styles.options}>
            {options.map((option, index) => {
              const text = option.text ?? '';
              let content: React.ReactNode;
              if (text.startsWith('image::')) {
                content = <CustomImage height="100%" width="100%" resizeMode="contain" source={getAppImage('messages', text.split('::')[1])} />;
              } else if (text.startsWith('rate::')) {
                content = (
                  <CustomText bold center color={colors.optionText} variant="subtext" numberOfLines={2} text={`${text.split('::')[1]} ★`} />
                );
              } else if (text.startsWith('file::')) {
                content = <CustomText bold center color="#81b0ff" variant="subtext" numberOfLines={2} text={text.split('::')[1]} />;
              } else {
                content = (
                  <CustomText center color={colors.optionText} variant="subtext" numberOfLines={2} text={text || "(Don't Reply)"} />
                );
              }
              return (
                <CustomButton
                  key={index}
                  delayPressIn={0}
                  activeOpacity={0.6}
                  silent
                  onPress={() => chooseOption(phone, chatName, index)}
                  style={[styles.option, { height: OPTION_HEIGHTS[Math.min(options.length, 3) - 1], backgroundColor: colors.option }]}>
                  {content}
                </CustomButton>
              );
            })}
          </View>
        )}
      </Animated.View>
      <Profile phone={phone} chatName={chatName} visible={showProfile} setVisible={setShowProfile} />
      {imageView ? <ImageView data={imageView} setImageView={setImageView} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, flexDirection: 'column' },
  divider: { borderRadius: 10, height: '0.2%', width: '100%', alignSelf: 'center' },
  optionsWrapper: { width: '100%', height: '26%', justifyContent: 'flex-start', alignItems: 'center' },
  options: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: '3%',
    paddingHorizontal: '5%',
    paddingBottom: '5%',
  },
  option: {
    width: '100%',
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: '1%',
    borderRadius: scale(16),
    paddingHorizontal: scale(2),
    paddingVertical: scale(2),
    borderWidth: 0,
  },
});
