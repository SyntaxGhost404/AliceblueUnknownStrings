import React from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { getAppImage, getContactImage } from '../../assets/images';
import contacts from '../../content/mock/contacts';
import useBlink from './useBlink';

const chatColors = (theme as any).myphone.messages.colors.chat;

export type ImageViewData = { image: { source: any; aspectRatio: number }; gather?: any };

type Props = {
  text: string;
  blinking: boolean;
  sender?: string;
  type: number;
  group?: boolean;
  setImageView: (data: ImageViewData) => void;
  magnifyDisabled?: boolean;
};

/** Photo bubble; tapping opens it full screen. */
export default function MessageImage({ text, blinking, sender, type, group, setImageView, magnifyDisabled }: Props) {
  const opacity = useBlink(blinking);
  const key = text.split('::')[1];
  const source = getAppImage('messages', key);
  const resolved = source ? Image.resolveAssetSource(source as any) : null;
  const aspectRatio = resolved?.width && resolved?.height ? resolved.width / resolved.height : 1;

  return (
    <View style={[styles.message, { backgroundColor: chatColors['message' + (type + 1)] }]}>
      <Animated.View style={{ opacity }}>
        {group && type === 0 && sender ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: '1%', paddingHorizontal: '4%', paddingVertical: '2%' }}>
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
              text={contacts[sender]?.name ?? sender}
            />
          </View>
        ) : null}
        <CustomButton
          style={{ width: '100%', aspectRatio }}
          activeOpacity={0.9}
          disabled={magnifyDisabled}
          onPress={() => setImageView({ image: { source, aspectRatio } })}>
          <CustomImage source={source} width="100%" height="100%" resizeMode="contain" />
        </CustomButton>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  message: {
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '80%',
    width: '80%',
    borderRadius: scale(14),
    overflow: 'hidden',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});
