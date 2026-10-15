import React, { useContext, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import assets from '../../assets';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { GlobalContext } from '../../state/GlobalProvider';
import { getAppString } from '../../content/appStrings';
import { PhoneName } from '../../content/types';
import Header from './Header';
import { getInbox, getSender, isNewMail, MailState } from './mailData';

type Props = { phone: PhoneName; navigation: any; setNotiBarColor: (c: string) => void };

/** Inbox: one row per mail with the sender's initial, name and subject. */
export default function Home({ phone, navigation, setNotiBarColor }: Props) {
  const { session, recoveredApps, date, time, appsData } = useContext(GlobalContext);
  const colors = (theme as any)[phone].mail.colors;
  const state: MailState = appsData[phone].apps?.mail ?? {};
  const recovered = recoveredApps?.mail ?? [];
  const inbox = useMemo(
    () => getInbox(session, date, time, state.delivered),
    [session, date, time, state.delivered],
  );

  return (
    <View style={[styles.parentLayout, { backgroundColor: colors.background }]}>
      <Header phone={phone} setNotiBarColor={setNotiBarColor} />
      <CustomText style={{ margin: theme.padding }} bold color={colors.accent} text={getAppString('herphone', 'mail', 'inbox')} />
      <ScrollView scrollIndicatorInsets={{ right: 1 }} contentContainerStyle={styles.inbox}>
        {inbox.map(mail => {
          const isRecovered = recovered.includes(mail.id);
          const opacity = isRecovered ? 0.75 : 1;
          const unread = isNewMail(mail, state.delivered) && !state.read?.includes(mail.id);
          const sender = getSender(mail);
          return (
            <CustomButton
              key={mail.id}
              activeOpacity={0.4}
              style={styles.mail}
              onPress={() => navigation.navigate('mailview', { email: mail })}>
              <View style={[styles.icon, { backgroundColor: colors.accent, opacity }]}>
                <CustomText
                  style={{ marginBottom: '8%' }}
                  bold
                  white
                  variant="h4"
                  noDefaultMargin
                  text={sender.name.charAt(0)}
                />
              </View>
              <View style={[styles.messageBody, { opacity }]}>
                <View style={styles.mailHeader}>
                  <CustomText white bold numberOfLines={1} noDefaultMargin text={sender.name} />
                  {isRecovered ? (
                    <View style={styles.recovered}>
                      <CustomImage width="73%" aspectRatio={1} source={assets.notifications['recovery-black']} />
                    </View>
                  ) : null}
                  {unread ? <View style={styles.badge} /> : null}
                </View>
                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}>
                  <CustomText
                    style={{ width: '100%' }}
                    variant="caption"
                    gray
                    numberOfLines={1}
                    noDefaultMargin
                    text={mail.subject}
                  />
                </View>
              </View>
            </CustomButton>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, flexDirection: 'column' },
  inbox: { width: '100%', paddingHorizontal: theme.padding as any, paddingBottom: '4%', alignItems: 'center' },
  mail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: '3%',
  },
  icon: { width: '15%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: scale(100) },
  messageBody: { width: '82%', marginBottom: '2%' },
  mailHeader: { width: '100%', flexDirection: 'row', alignItems: 'center' },
  recovered: {
    width: '6%',
    aspectRatio: 1,
    marginTop: '1%',
    marginLeft: '2.5%',
    borderRadius: scale(100),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    width: '3%',
    aspectRatio: 1,
    marginTop: '1%',
    marginLeft: '4%',
    borderRadius: scale(100),
    backgroundColor: theme.colors.red,
  },
});
