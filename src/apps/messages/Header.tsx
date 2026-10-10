import React, { useContext } from 'react';
import { Dimensions, I18nManager, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ArrowRight, X } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import ProfilePicture from '../../components/ProfilePicture';
import assets from '../../assets';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { GlobalContext } from '../../state/GlobalProvider';
import { getProfileName, getProfileStatus } from '../../content';
import { getGeneral } from '../../content/general';
import contacts from '../../content/mock/contacts';
import { PhoneName } from '../../content/types';

const { width: W } = Dimensions.get('screen');
const SIDE_PADDING = (W * 5.6) / 100;

type Props = {
  phone: PhoneName;
  chatName?: string;
  setNotiBarColor: (c: string) => void;
  onTitleClick?: () => void;
};

/** Messages title bar: back, contact (avatar, online dot, status) or app name, close. */
export default function Header({ phone, chatName, setNotiBarColor, onTitleClick }: Props) {
  const navigation = useNavigation<any>();
  const { event, notifications, usersOnline } = useContext(GlobalContext);
  const colors = (theme as any)[phone].messages.colors.header;
  const Back = I18nManager.isRTL ? ArrowRight : ArrowLeft;
  const contact = chatName ? contacts[chatName] : undefined;
  const status = chatName ? getProfileStatus(chatName) : '';
  const unreadElsewhere = notifications[phone].filter(n => n.app === 'messages').length > 0;

  return (
    <View style={[styles.header, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <CustomImage style={{ position: 'absolute' }} width="100%" height="100%" source={assets.messages.header} />
      <View style={styles.leftContainer}>
        <CustomButton
          activeOpacity={0.6}
          style={[styles.button, { alignItems: 'flex-start', paddingLeft: SIDE_PADDING }]}
          onPress={() => navigation.popTo('home')}>
          <Back size={scale(32)} color={colors.items} />
          {chatName && unreadElsewhere ? <View style={styles.badge} /> : null}
        </CustomButton>
      </View>
      <View style={styles.middleContainer}>
        <CustomButton activeOpacity={0.7} style={styles.title} onPress={onTitleClick} disabled={!onTitleClick}>
          {chatName ? (
            <ProfilePicture style={{ marginRight: '4%' }} height="70%" aspectRatio={1} name={chatName} />
          ) : null}
          <CustomText
            style={{ marginBottom: '1%' }}
            center
            white
            bold
            variant="h5"
            noDefaultMargin
            text={chatName ? getProfileName(chatName) : getGeneral('apps', 'messages')}
          />
          {chatName && !contact?.group ? (
            <View
              style={{
                width: scale(10),
                aspectRatio: 1,
                borderRadius: scale(100),
                marginTop: '1%',
                marginLeft: '4%',
                backgroundColor: usersOnline.includes(chatName) ? colors.status.online : colors.status.offline,
              }}
            />
          ) : null}
        </CustomButton>
        {chatName && !contact?.group && status !== '' ? (
          <CustomText style={{ opacity: 0.6, fontStyle: 'italic' }} center gray variant="small" noDefaultMargin text={status} />
        ) : null}
        {contact?.group ? (
          <CustomText
            style={{ opacity: 0.6, fontStyle: 'italic' }}
            center
            gray
            variant="small"
            noDefaultMargin
            text={'You, ' + contact.group.members.map(m => contacts[m]?.name ?? m).join(', ')}
          />
        ) : null}
      </View>
      <View style={styles.rightContainer}>
        {!event?.flashback ? (
          <CustomButton
            activeOpacity={0.6}
            onPress={() => {
              setNotiBarColor((theme as any)[phone].homescreen.colors.notificationBar);
              navigation.popTo('homescreen');
            }}
            style={[styles.button, { alignItems: 'flex-end', paddingRight: SIDE_PADDING }]}>
            <X size={scale(32)} color={colors.items} />
          </CustomButton>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: '9%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  leftContainer: { width: '8%', height: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
  middleContainer: { width: '70%', height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
  title: { width: '100%', height: '60%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  rightContainer: {
    width: '8%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 0,
  },
  button: { height: '100%', aspectRatio: 1.1, justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: '30%',
    right: '40%',
    width: '14%',
    aspectRatio: 1,
    borderRadius: scale(100),
    backgroundColor: theme.colors.red,
    opacity: 1,
    elevation: 5,
  },
});
