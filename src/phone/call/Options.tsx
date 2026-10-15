import React, { useContext } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import { scale } from '../../theme/scale';
import { CallReply } from '../../content/mock/callTypes';
import { CallStateContext } from './callContext';
import { useCallOptions } from './useCallOptions';

const SHOW_TIME = 400;

/** Timed replies inside the floating call card; the bar counts down, then a reply is picked at random. */
export default function Options({ data }: { data: CallReply[] }) {
  const { selectReply } = useContext(CallStateContext);
  const { anims, bar, countdown, disabled, select } = useCallOptions(data, SHOW_TIME, selectReply);

  return (
    <View style={[styles.options, { justifyContent: data.length > 1 ? 'space-between' : 'center' }]}>
      {data.map((option, index) => (
        <React.Fragment key={index}>
          <Animated.View style={[styles.option, { height: data.length > 1 ? '45%' : '65%', opacity: anims[index] }]}>
            <CustomButton disabled={disabled} activeOpacity={0.9} onPress={() => select(index)}>
              <CustomText center variant="subtext" color="#FFFFFF" text={option.text} />
            </CustomButton>
          </Animated.View>
          {data.length > 1 && index === 0 ? (
            <Animated.View
              style={{
                width: '60%',
                height: scale(1.5),
                backgroundColor: '#FFFFFF22',
                borderRadius: scale(40),
                opacity: bar,
                transform: [{ scaleX: countdown }],
              }}
            />
          ) : null}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  options: { width: '100%', height: '100%', paddingHorizontal: '6%', alignItems: 'center' },
  option: { width: '100%', justifyContent: 'center', alignItems: 'center' },
});
