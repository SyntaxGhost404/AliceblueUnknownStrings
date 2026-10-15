import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomModal from '../../components/CustomModal';
import CustomText from '../../components/CustomText';
import assets from '../../assets';
import { SOCIAL_LINKS } from '../../config';
import { scale } from '../../theme/scale';
import { newEpisodeChannels } from '../../content/mock/modals';

const icons = {
  discord: assets.settings['discord-primary'],
  instagram: assets.settings['instagram-primary'],
  twitter: assets.settings['twitter-primary'],
};

/** "New episode coming" card: key art plus the channels where news is announced. */
export default function NewEpisodeModal({ onClose }: { onClose: () => void }) {
  const open = (key: keyof typeof icons) => {
    const link = SOCIAL_LINKS.find(s => s.name === key)?.link;
    if (link) Linking.openURL(link);
  };

  return (
    <CustomModal visible setVisible={onClose}>
      <View style={styles.container}>
        <CustomImage width="100%" aspectRatio={1.46} source={assets.settings.newepisodemodal} />
        <View style={styles.buttons}>
          {newEpisodeChannels.map(item => (
            <CustomButton key={item.key} activeOpacity={0.6} style={styles.button} onPress={() => open(item.key)}>
              <CustomImage
                width="7%"
                style={{ marginRight: '2%' }}
                aspectRatio={1}
                resizeMode="contain"
                source={icons[item.key]}
              />
              <CustomText variant="text" accent style={{ fontFamily: 'JosefinSans-Regular', marginBottom: '3%' }} text={item.name}>
                <CustomText variant="text" white style={{ fontFamily: 'JosefinSans-Regular' }} text={' - ' + item.description} />
              </CustomText>
            </CustomButton>
          ))}
        </View>
      </View>
    </CustomModal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '88%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1%',
    backgroundColor: '#010101',
    borderRadius: scale(16),
    overflow: 'hidden',
  },
  buttons: { width: '100%', alignItems: 'center', paddingHorizontal: '7%', marginVertical: '4%' },
  button: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: '3%',
    paddingHorizontal: '2%',
    borderRadius: scale(100),
    borderWidth: scale(0.5),
    borderColor: '#303030',
    marginVertical: '2%',
  },
});
