import React from 'react';
import { DimensionValue, StyleProp, View, ViewStyle } from 'react-native';
import CustomImage from './CustomImage';
import { scale } from '../theme/scale';
import { getContactImage } from '../assets/images';
import contacts from '../content/mock/contacts';

// Group avatars tile member portraits: one, two side by side, or two over one.
const groupWidths: DimensionValue[][] = [['100%'], ['100%', '100%'], ['50%', '50%', '100%'], ['50%', '50%', '50%', '50%']];

type Props = {
  name?: string;
  width?: DimensionValue;
  height?: DimensionValue;
  aspectRatio?: number;
  style?: StyleProp<ViewStyle>;
};

/** Round contact portrait; group chats show their members' portraits in a mosaic. */
export default function ProfilePicture({ name, width, height, aspectRatio, style }: Props) {
  const contact = name ? contacts[name] : undefined;
  if (!contact?.group) {
    return (
      <View style={[{ width, height, aspectRatio }, style ?? {}]}>
        <CustomImage style={{ borderRadius: scale(100) }} width="100%" height="100%" source={getContactImage(name)} />
      </View>
    );
  }
  const members = contact.group.members;
  const widths = groupWidths[Math.min(members.length, 4) - 1];
  return (
    <View style={[{ width, height, aspectRatio }, style ?? {}]}>
      <View
        style={{ flexDirection: 'row', flexWrap: 'wrap', width: '100%', height: '100%', borderRadius: scale(100), overflow: 'hidden' }}>
        {members.slice(0, 4).map((member, index) => (
          <CustomImage key={member} width={widths[index]} height="50%" source={getContactImage(member)} />
        ))}
      </View>
    </View>
  );
}
