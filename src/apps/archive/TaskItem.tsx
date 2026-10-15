import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { PenLine } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import assets from '../../assets';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { createAnimation } from '../../theme/animation';

const ACCENT = '#89B1C3';

type Props = { current: boolean; last: boolean; title: string; infos?: string[] };

/** One task on the timeline: diamond (pulsing for the current one), connecting line, title and clues. */
export default function TaskItem({ current, last, title, infos }: Props) {
  const pulse = useRef(new Animated.Value(1)).current;
  const [diamondHeight, setDiamondHeight] = useState(0);

  useEffect(() => {
    if (!current) return;
    pulse.setValue(1);
    const loop = Animated.loop(
      Animated.sequence([
        createAnimation(pulse, 1.25, 800, Easing.ease),
        createAnimation(pulse, 1, 800, Easing.ease),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [current, pulse]);

  return (
    <CustomButton onPress={() => {}} silent activeOpacity={1} style={[styles.parentLayout, { opacity: 1 }]}>
      <View style={styles.left}>
        <Animated.View
          onLayout={(e: LayoutChangeEvent) => setDiamondHeight(e.nativeEvent.layout.height)}
          style={{ width: '80%', transform: [{ scale: current ? pulse : 1 }] }}>
          <CustomImage
            width="100%"
            aspectRatio={1}
            resizeMode="contain"
            source={current ? assets.notifications.diamond : assets.archive['diamond-done']}
          />
        </Animated.View>
        {!last ? (
          <View
            style={{
              width: '10%',
              flexGrow: 1,
              borderRadius: scale(1000),
              backgroundColor: current ? theme.colors.white : ACCENT,
            }}
          />
        ) : null}
      </View>
      <View style={styles.right}>
        <CustomText
          color={current ? 'white' : ACCENT}
          bold
          noDefaultMargin
          style={{ marginTop: diamondHeight * 0.175, fontSize: scale(current ? 13 : 12) }}
          text={title}
        />
        {infos?.map((info, index) => (
          <View key={index} style={styles.info}>
            <PenLine style={{ marginRight: '2%', marginTop: '1.5%' }} color="#89B1C3BB" size={scale(10)} />
            <CustomText
              bold
              noDefaultMargin
              style={{ width: '90%', fontSize: scale(11), marginBottom: '1%', color: '#89B1C3BB' }}
              text={info}
            />
          </View>
        ))}
      </View>
    </CustomButton>
  );
}

const styles = StyleSheet.create({
  parentLayout: { width: '100%', flexDirection: 'row', justifyContent: 'space-between' },
  left: { width: '12%', justifyContent: 'flex-start', alignItems: 'center' },
  right: { width: '88%', paddingHorizontal: '2%', paddingBottom: '6%' },
  info: { width: '100%', flexDirection: 'row', justifyContent: 'flex-start', paddingTop: '4%' },
});
