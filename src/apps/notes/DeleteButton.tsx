import React, { useEffect, useRef, useState } from 'react';
import { Animated, I18nManager, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import { scale } from '../../theme/scale';
import { playAnimation } from '../../theme/animation';
import { getAppString } from '../../content/appStrings';
import { PhoneName } from '../../content/types';

type Props = {
  phone: PhoneName;
  /** Larger trash icon (note screen). */
  big?: boolean;
  /** Invisible and inert (a brand-new note has nothing to delete yet). */
  hidden?: boolean;
  /** Fires once the button has measured itself, so the owner can fade in without a jump. */
  onLoad?: () => void;
  onConfirmDelete: () => void;
};

const isRTL = I18nManager.isRTL;

/**
 * Two-step delete: a grey trash icon; tapping it slides the icon right (red) and fades in a
 * "Confirm" label on a faint pill for three seconds, during which tapping the pill deletes.
 */
export default function DeleteButton({ phone, big, hidden, onLoad, onConfirmDelete }: Props) {
  const slide = useRef(new Animated.Value(0)).current;
  const [fullWidth, setFullWidth] = useState<number | null>(null);
  const [trashX, setTrashX] = useState<number | null>(null);
  const [trashWidth, setTrashWidth] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;

  // Once everything is measured the trash icon is parked over the (still invisible) label.
  useEffect(() => {
    if (fullWidth === null || trashX === null || trashWidth === null) return;
    const parked = isRTL ? -(fullWidth - trashWidth - trashX) : trashX;
    setOffset(parked);
    slide.setValue(-parked);
    onLoadRef.current?.();
  }, [fullWidth, trashX, trashWidth, slide]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const confirmDelete = () => {
    if (timer.current) clearTimeout(timer.current);
    setConfirming(false);
    onConfirmDelete();
  };

  const onDelete = () => {
    setConfirming(true);
    playAnimation(slide, 0, 400);
    timer.current = setTimeout(() => {
      setConfirming(false);
      playAnimation(slide, -offset, 400);
    }, 3000);
  };

  const range = (factor = 1) => (isRTL ? [0, -offset * factor] : [-offset * factor, 0]);
  const iconSize = scale(big ? 26 : 22);

  return (
    <View style={styles.delete}>
      <Animated.View
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: '#FFFFFF09',
          opacity: slide.interpolate({ inputRange: range(), outputRange: isRTL ? [1, 0] : [0, 1] }),
        }}
      />
      <CustomButton
        onLayout={(e: LayoutChangeEvent) => setFullWidth(e.nativeEvent.layout.width)}
        onPress={confirmDelete}
        disabled={!confirming}
        style={[styles.button, { paddingLeft: '5%', justifyContent: 'center' }]}>
        <Animated.View
          style={{
            marginRight: '2%',
            opacity: slide.interpolate({ inputRange: range(0.4), outputRange: isRTL ? [1, 0] : [0, 1] }),
          }}>
          <CustomText noDefaultMargin color="#EA5B5B" variant="caption" text={getAppString(phone, 'notes', 'confirm')} />
        </Animated.View>
        <Animated.View
          onLayout={(e: LayoutChangeEvent) => {
            setTrashX(e.nativeEvent.layout.x);
            setTrashWidth(e.nativeEvent.layout.width);
          }}
          style={{ transform: [{ translateX: slide }] }}>
          <CustomButton style={{ opacity: hidden ? 0 : 1 }} disabled={hidden || confirming} onPress={onDelete}>
            <Animated.View
              style={{
                position: 'absolute',
                opacity: slide.interpolate({ inputRange: range(), outputRange: isRTL ? [0, 1] : [1, 0] }),
              }}>
              <Trash2 color="#666666" size={iconSize} strokeWidth={1.5} />
            </Animated.View>
            <Animated.View style={{ opacity: slide.interpolate({ inputRange: range(), outputRange: [0, 1] }) }}>
              <Trash2 color="#EA5B5B" size={iconSize} strokeWidth={1.5} />
            </Animated.View>
          </CustomButton>
        </Animated.View>
      </CustomButton>
    </View>
  );
}

const styles = StyleSheet.create({
  delete: { backgroundColor: 'transparent', borderRadius: scale(4) },
  button: { flexDirection: 'row', backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
});
