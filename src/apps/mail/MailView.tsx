import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Animated, Dimensions, Easing, ScrollView, StyleSheet, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomModal from '../../components/CustomModal';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { createAnimation } from '../../theme/animation';
import { getAppImage } from '../../assets/images';
import { GlobalContext } from '../../state/GlobalProvider';
import { getAppString } from '../../content/appStrings';
import { MailAttachment } from '../../content/mock/mail';
import { PhoneName } from '../../content/types';
import Header from './Header';
import { getSender, resolveMail } from './mailData';
import useImageAspect from './useImageAspect';

const { height: H } = Dimensions.get('screen');

type Props = { phone: PhoneName; route: any; setNotiBarColor: (c: string) => void };

const attachmentImage = (attachment: MailAttachment) => {
  const [folder, key] = attachment.image.split('/');
  return getAppImage(folder, key);
};

/** One mail: subject, sender line, then the text or the picture body, and attachment cards. */
export default function MailView({ phone, route, setNotiBarColor }: Props) {
  const { setNotifications, gatherInfos, handleGatherInfo, setRecoveredApps, updateAppState } = useContext(GlobalContext);
  const email = useMemo(() => resolveMail(route.params?.email), [route.params?.email]);
  const colors = (theme as any)[phone].mail.colors;
  const [pulse] = useState(() => new Animated.Value(1));
  const [preview, setPreview] = useState<MailAttachment | null>(null);
  const bodyImage = email?.image ? getAppImage('mail', email.image) : undefined;
  const aspect = useImageAspect(bodyImage);
  const gatherId = `mail:${email?.id}`;
  const canGather = !!email?.hotspot && !!gatherInfos?.some(info => info.id === gatherId);

  // Opening a mail reads it: it leaves the notification shade and the "recovered" marks.
  useEffect(() => {
    if (!email) return;
    updateAppState(phone, 'mail', (prev: any) =>
      prev.read?.includes(email.id) ? prev : { ...prev, read: [...(prev.read ?? []), email.id] },
    );
    setRecoveredApps(prev => (prev?.mail?.includes(email.id) ? { ...prev, mail: prev.mail.filter(id => id !== email.id) } : prev));
    setNotifications(prev =>
      prev[phone].some(n => n.app === 'mail' && n.id === email.id)
        ? { ...prev, [phone]: prev[phone].filter(n => !(n.app === 'mail' && n.id === email.id)) }
        : prev,
    );
  }, [email, phone, updateAppState, setRecoveredApps, setNotifications]);

  // The clue spot pulses while its clue is still to be gathered.
  useEffect(() => {
    if (!canGather) return;
    const loop = Animated.loop(
      Animated.sequence([
        createAnimation(pulse, 0.2, 1000, Easing.linear),
        createAnimation(pulse, 1, 1000, Easing.linear),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      pulse.setValue(1);
    };
  }, [canGather, pulse]);

  if (!email) return null;
  const sender = getSender(email);
  const hotspot = email.hotspot;

  return (
    <View style={[styles.parentLayout, { backgroundColor: colors.background }]}>
      <Header phone={phone} showBack setNotiBarColor={setNotiBarColor} />
      <ScrollView>
        <View style={styles.content} onStartShouldSetResponder={() => true}>
          <CustomText style={{ marginVertical: '3%' }} white variant="h5" text={email.subject} />
          <View style={styles.title}>
            <View style={[styles.icon, { backgroundColor: colors.accent }]}>
              <CustomText white variant="h5" noDefaultMargin text={sender.name.charAt(0)} />
            </View>
            <View style={styles.titleBody}>
              <View style={styles.titleInfo}>
                <CustomText white variant="subtext" numberOfLines={1} noDefaultMargin text={sender.email} />
              </View>
              <CustomText variant="small" gray numberOfLines={1} noDefaultMargin text={getAppString('herphone', 'mail', 'to_me')} />
            </View>
          </View>
          {email.image ? (
            aspect > 0 ? (
              <View style={{ width: '100%', aspectRatio: aspect }}>
                <CustomImage width="100%" height="100%" source={bodyImage} />
                {hotspot ? (
                  <CustomButton
                    disabled={!canGather}
                    onPress={() => handleGatherInfo(gatherId)}
                    style={{
                      position: 'absolute',
                      top: hotspot.top as any,
                      left: hotspot.left as any,
                      width: hotspot.width as any,
                      aspectRatio: hotspot.aspectRatio,
                    }}>
                    <Animated.Image
                      style={{ width: '100%', height: '100%', opacity: pulse }}
                      source={getAppImage('mail', hotspot.image) as any}
                    />
                  </CustomButton>
                ) : null}
              </View>
            ) : null
          ) : (
            <CustomText variant="subtext" white noDefaultMargin text={email.body} />
          )}
          {email.withimage ? (
            <CustomImage width="50%" aspectRatio={2} resizeMode="contain" source={getAppImage('mail', email.withimage)} />
          ) : null}
          {email.attachments ? (
            <View style={styles.attachments}>
              {email.attachments.map(attachment => (
                <CustomButton
                  key={attachment.name}
                  style={styles.attachment}
                  activeOpacity={0.8}
                  onPress={() => setPreview(attachment)}>
                  <View style={styles.attachmentImage}>
                    <CustomImage width="100%" height="100%" source={attachmentImage(attachment)} />
                    <CustomText
                      noDefaultMargin
                      white
                      style={[styles.attachmentType, { backgroundColor: colors.attachmentInfo }]}
                      text={attachment.type}
                    />
                  </View>
                  <View style={[styles.attachmentInfo, { backgroundColor: colors.attachmentInfo }]}>
                    <CustomText variant="small" noDefaultMargin white numberOfLines={1} text={attachment.name} />
                  </View>
                </CustomButton>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
      <CustomModal visible={preview !== null} setVisible={() => setPreview(null)}>
        {preview ? (
          <View style={styles.preview}>
            <CustomImage width="100%" height="100%" resizeMode="contain" source={attachmentImage(preview)} />
          </View>
        ) : null}
      </CustomModal>
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, flexDirection: 'column' },
  content: { width: '100%', paddingHorizontal: theme.padding as any },
  title: { flexDirection: 'row', width: '100%', height: H * 0.06, marginBottom: '3%', alignItems: 'center' },
  icon: { height: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 100 },
  titleBody: { height: '100%', marginLeft: '4%', justifyContent: 'space-around' },
  titleInfo: { flexDirection: 'row', alignItems: 'flex-end' },
  attachments: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', marginTop: '6%' },
  attachment: {
    width: '45%',
    aspectRatio: 1.4,
    marginRight: '5%',
    marginBottom: '5%',
    borderRadius: scale(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  attachmentImage: {
    width: '100%',
    height: '75%',
    borderTopLeftRadius: scale(4),
    borderTopRightRadius: scale(4),
    overflow: 'hidden',
  },
  attachmentType: {
    position: 'absolute',
    top: 0,
    right: -1,
    fontSize: scale(12),
    paddingHorizontal: '4%',
    paddingVertical: '2%',
    borderTopRightRadius: scale(4),
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: '25%',
    paddingHorizontal: '4%',
    paddingVertical: '2%',
    borderBottomLeftRadius: scale(4),
    borderBottomRightRadius: scale(4),
  },
  preview: { width: '88%', aspectRatio: 1 },
});
