import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import { scale } from '../../theme/scale';
import { getSuspectBoardObject } from '../../assets/images';
import { dontForget } from '../../content/mock/desk';

/**
 * The handwritten "don't forget" sticky note beside the photo frame. Rendered tiny on the
 * desk and again, `big`, in the full-screen viewer.
 */
export default function DontForget({ big }: { big?: boolean }) {
  return (
    <View style={styles.parentLayout}>
      <CustomImage
        style={{ position: 'absolute' }}
        width="100%"
        height="100%"
        source={getSuspectBoardObject('rememberlist')}
      />
      <CustomText style={{ fontFamily: 'Caveat-Regular', fontSize: big ? scale(40) : scale(8) }} text={dontForget.title} />
      {dontForget.list.map((item, index) => (
        <CustomText
          key={index}
          style={{
            fontFamily: 'Caveat-Regular',
            fontSize: big ? scale(20) : scale(3),
            textDecorationLine: item.done ? 'line-through' : 'none',
          }}
          text={item.text}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
});
