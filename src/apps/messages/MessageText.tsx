import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { getContactImage } from '../../assets/images';
import contacts from '../../content/mock/contacts';
import { formatMessageTime } from './chatData';
import useBlink from './useBlink';

const chatColors = (theme as any).myphone.messages.colors.chat;

type Props = { text: string; blinking: boolean; sender?: string; type: number; time: string; group?: boolean };

/** Text bubble (also contact cards, file and link payloads), with its time underneath. */
export default function MessageText({ text, blinking, sender, type, time, group }: Props) {
  const opacity = useBlink(blinking);
  const isContact = text.startsWith('contact::');
  const isLink = text.startsWith('file::') || text.startsWith('url::');
  const showSender = group && type === 0 && !!sender;

  let display = text;
  if (isContact) {
    const key = text.split('::')[1].trim().toLowerCase();
    display = `Contact\n${contacts[key]?.name ?? key}\n${contacts[key]?.number ?? ''}`;
  } else if (text.includes('::') && (isLink || text.startsWith('rate::'))) {
    display = text.split('::')[1];
  }

  return (
    <View
      style={[
        styles.message,
        {
          paddingHorizontal: isContact ? '5%' : '4%',
          paddingVertical: showSender ? '2%' : '2.5%',
          backgroundColor: chatColors['message' + (type + 1)],
        },
      ]}>
      <Animated.View style={{ opacity }}>
        {showSender ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: '1%' }}>
            <CustomImage
              style={{ marginRight: scale(8), borderRadius: scale(100) }}
              width={scale(18)}
              aspectRatio={1}
              source={getContactImage(sender)}
            />
            <CustomText
              variant="subtext"
              bold
              noDefaultMargin
              style={{ color: chatColors.sender, alignSelf: 'flex-start' }}
              text={contacts[sender!]?.name ?? sender}
            />
          </View>
        ) : null}
        <CustomText
          style={[styles.text, { paddingHorizontal: 0, fontSize: isContact ? scale(14) : scale(15) }]}
          color={isLink ? '#81b0ff' : isContact ? chatColors.contactText : chatColors['message' + (type + 1) + 'text']}
          bold={isContact || isLink}
          center={isContact}
          noDefaultMargin
          variant="subtext"
          text={display}
        />
        <CustomText
          style={[styles.time, { alignSelf: type === 0 ? 'flex-start' : 'flex-end' }]}
          noDefaultMargin
          color={chatColors.date}
          variant="small"
          numberOfLines={1}
          text={formatMessageTime(time)}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  message: { justifyContent: 'center', alignItems: 'center', maxWidth: '88%', borderRadius: scale(14), overflow: 'hidden' },
  text: { letterSpacing: scale(0.5), borderColor: 'red', borderWidth: 0 },
  time: { marginTop: scale(2), borderWidth: 0, borderColor: 'red' },
});
