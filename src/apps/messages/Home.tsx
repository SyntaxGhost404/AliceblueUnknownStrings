import React, { useContext, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import ProfilePicture from '../../components/ProfilePicture';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { chatKey, GlobalContext } from '../../state/GlobalProvider';
import { getChatNames, getProfileName } from '../../content';
import { getAppString } from '../../content/appStrings';
import contacts from '../../content/mock/contacts';
import { PhoneName } from '../../content/types';
import Header from './Header';
import { getHistory, messageMoment, previewText } from './chatData';

type Props = { phone: PhoneName; navigation: any; setNotiBarColor: (c: string) => void };

/** Conversation list, most recent first; chats waiting on the player are lit up. */
export default function Home({ phone, navigation, setNotiBarColor }: Props) {
  const { session, appsData, chat, usersOnline } = useContext(GlobalContext);
  const colors = (theme as any)[phone].messages.colors;

  const chats = useMemo(() => {
    const names = [...new Set([...getChatNames(phone), ...Object.keys(appsData[phone].messages)])];
    return names
      .map(chatName => {
        const all = [...getHistory(phone, chatName), ...(appsData[phone].messages[chatName] ?? [])];
        const reversed = [...all].reverse();
        const last = reversed.find(m => !m.text.startsWith('system::')) ?? reversed[0];
        const key = chatKey(phone, chatName);
        return {
          chatName,
          name: getProfileName(chatName),
          group: !!contacts[chatName]?.group,
          message: previewText(last, session),
          time: last ? messageMoment(last, session) : null,
          live: (appsData[phone].messages[chatName]?.length ?? 0) > 0,
          highlight: !!chat.options[key] || !!chat.unread[key] || !!chat.typing[key],
        };
      })
      .sort((a, b) => {
        if (a.live !== b.live) return a.live ? -1 : 1;
        return (b.time?.valueOf() ?? 0) - (a.time?.valueOf() ?? 0);
      });
  }, [phone, appsData, chat, session]);

  return (
    <View style={[styles.parentLayout, { backgroundColor: colors.home.background }]}>
      <Header phone={phone} setNotiBarColor={setNotiBarColor} />
      {chats.length === 0 ? (
        <CustomText style={{ marginTop: '6%' }} variant="subtext" white text={getAppString('myphone', 'messages', 'no_messages')} />
      ) : null}
      <ScrollView style={{ width: '100%' }} contentContainerStyle={styles.list} scrollIndicatorInsets={{ right: 1 }}>
        {chats.map(item => {
          const opacity = item.highlight ? 1 : 0.75;
          return (
            <CustomButton
              key={item.chatName}
              style={styles.chat}
              activeOpacity={0.5}
              onPress={() => navigation.navigate('chat', { chatName: item.chatName, group: item.group })}>
              <ProfilePicture width="17%" aspectRatio={1} name={item.chatName} style={{ opacity }} />
              <View style={styles.content}>
                <View style={styles.name}>
                  <CustomText noDefaultMargin bold white text={item.name} style={{ opacity }} />
                  {!item.group ? (
                    <View
                      style={{
                        width: scale(10),
                        aspectRatio: 1,
                        borderRadius: scale(100),
                        marginLeft: '3%',
                        marginTop: '2%',
                        backgroundColor: usersOnline.includes(item.chatName)
                          ? colors.header.status.online
                          : colors.header.status.offline,
                      }}
                    />
                  ) : null}
                </View>
                <CustomText
                  white
                  bold={item.highlight}
                  variant="subtext"
                  text={item.message}
                  numberOfLines={1}
                  style={{ opacity }}
                />
              </View>
              <View style={{ width: '9%', alignItems: 'flex-end', transform: [{ rotateY: '180deg' }] }}>
                {item.highlight ? (
                  <MessageSquare style={{ opacity: 0.9 }} size={scale(22)} color={theme.colors.white} />
                ) : null}
              </View>
            </CustomButton>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, justifyContent: 'flex-start', alignItems: 'center' },
  list: { flexGrow: 1, flexDirection: 'column', paddingHorizontal: theme.padding as any, paddingVertical: '4%' },
  chat: { width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', paddingVertical: '3%' },
  content: { width: '73%', paddingHorizontal: '2.5%' },
  name: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
});
