import React, { useRef, useState } from 'react';
import { Dimensions, ScrollView, ScrollViewInstance, StyleSheet, View } from 'react-native';
import { scale } from '../../theme/scale';
import FAQItem, { FAQ } from './FAQItem';

const { height: SCREEN_H } = Dimensions.get('screen');

/** Scrollable FAQ card where at most one question is open at a time. */
export default function FAQList({ data }: { data: FAQ[] }) {
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [expanded, setExpanded] = useState(-1);

  const onQuestionPress = (index: number) => setExpanded(prev => (prev === index ? -1 : index));

  return (
    <View style={styles.parentLayout}>
      <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.faq} indicatorStyle="white">
        {data.map((item, index) => (
          <FAQItem
            key={index}
            index={index}
            scrollRef={scrollRef}
            last={index === data.length - 1}
            data={item}
            expanded={expanded === index}
            onQuestionPress={onQuestionPress}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { maxHeight: SCREEN_H * 0.35, marginVertical: '2%', borderRadius: scale(10), overflow: 'hidden' },
  scroll: { width: '100%' },
  faq: { width: '100%', backgroundColor: '#FFFFFF09', alignItems: 'center' },
});
