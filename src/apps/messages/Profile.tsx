import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomModal from '../../components/CustomModal';
import CustomText from '../../components/CustomText';
import ProfilePicture from '../../components/ProfilePicture';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { getProfileName, getProfileStatus } from '../../content';
import contacts from '../../content/mock/contacts';
import { PhoneName } from '../../content/types';

type Props = { phone: PhoneName; chatName: string; visible: boolean; setVisible: (v: boolean) => void };

/** Contact sheet that slides up from the bottom of a chat. */
export default function Profile({ phone, chatName, visible, setVisible }: Props) {
  const contact = contacts[chatName];
  const status = getProfileStatus(chatName);
  return (
    <CustomModal visible={visible} setVisible={setVisible} backdropColor="#000301dd">
      <View style={[styles.container, { backgroundColor: (theme as any)[phone].messages.colors.header.background }]}>
        <ProfilePicture style={{ marginRight: '5%' }} width="25%" aspectRatio={1} name={chatName} />
        <View style={styles.content}>
          <CustomText bold white variant="h5" text={getProfileName(chatName)} />
          {status ? (
            <CustomText style={{ fontStyle: 'italic', opacity: 0.9 }} noDefaultMargin white variant="caption" text={status} />
          ) : null}
          {contact?.group ? (
            <CustomText
              bold
              style={{ letterSpacing: 2 }}
              color="#DDF5FF"
              variant="caption"
              text={'You, ' + contact.group.members.map(m => contacts[m]?.name ?? m).join(', ')}
            />
          ) : (
            <CustomButton style={styles.button} onPress={() => {}}>
              <CustomText
                bold
                style={{ letterSpacing: 1 }}
                color="#DDF5FF"
                variant="subtext"
                text={contact?.private ? 'Contact: Private' : contact?.number}
              />
            </CustomButton>
          )}
        </View>
      </View>
    </CustomModal>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '6%',
    paddingVertical: '6%',
    paddingBottom: '8%',
    borderTopLeftRadius: scale(14),
    borderTopRightRadius: scale(14),
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '5%',
    paddingVertical: '2%',
    borderRadius: scale(4),
    backgroundColor: '#202020',
    marginTop: '6%',
    alignSelf: 'flex-start',
  },
  content: { width: '70%' },
});
