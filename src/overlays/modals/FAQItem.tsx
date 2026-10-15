import React, { useEffect, useState } from 'react';
import { Animated, LayoutChangeEvent, ScrollViewInstance, StyleSheet, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { playAnimation } from '../../theme/animation';
import { scale } from '../../theme/scale';

export type FAQ = { question: string; answer: string };

type Props = {
  index: number;
  scrollRef: React.RefObject<ScrollViewInstance | null>;
  last: boolean;
  data: FAQ;
  expanded: boolean;
  onQuestionPress: (index: number) => void;
};

/** One expandable FAQ row: the question with a chevron that flips, and the answer below it. */
export default function FAQItem({ index, scrollRef, last, data, expanded, onQuestionPress }: Props) {
  const [y, setY] = useState(0);
  const [rotation] = useState(() => new Animated.Value(0));

  useEffect(() => {
    playAnimation(rotation, expanded ? 1 : 0, 300);
  }, [expanded, rotation]);

  const onPress = () => {
    // Opening the last row scrolls it into view so its answer isn't cut off.
    if (!expanded && last) scrollRef.current?.scrollTo({ y, animated: true });
    onQuestionPress(index);
  };

  return (
    <CustomButton
      onLayout={(e: LayoutChangeEvent) => setY(e.nativeEvent.layout.y)}
      activeOpacity={1}
      style={[styles.faqItem, { borderBottomWidth: last ? 0 : scale(2) }]}
      onPress={onPress}>
      <View style={styles.faqItemQuestion}>
        <CustomText
          style={{ width: '85%' }}
          color={theme.colors.mediumGray}
          variant="subtext"
          text={`${index + 1}. ${data.question}`}
        />
        <Animated.View
          style={{ transform: [{ rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}>
          <ChevronDown color={theme.colors.mediumGray} strokeWidth={scale(1)} />
        </Animated.View>
      </View>
      {expanded ? <CustomText color={theme.colors.darkerGray} variant="subtext" text={data.answer} /> : null}
    </CustomButton>
  );
}

const styles = StyleSheet.create({
  faqItem: { width: '100%', paddingVertical: '2%', paddingHorizontal: '4%', borderBottomColor: '#040404' },
  faqItemQuestion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
});
