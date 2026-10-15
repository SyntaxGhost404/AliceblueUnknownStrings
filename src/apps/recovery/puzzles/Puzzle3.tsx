import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import CustomButton from '../../../components/CustomButton';
import CustomText from '../../../components/CustomText';
import { scale } from '../../../theme/scale';
import { playAnimation } from '../../../theme/animation';
import { BOARD_W, TILE_SOUND, usePuzzleFrame } from '../puzzleKit';

/** Values each knob steps through (a quarter turn per press). */
const KNOBS = [
  [0, 26, 27, 28],
  [0, 1, 2, 3],
  [0, 10, 20, 30],
];
/** The tank must end up at exactly this level (marked on the gauge). */
const TARGET = 71;
const TANK_W = BOARD_W * 0.8;
const KNOB_SIZE = TANK_W * 0.25666666666666665;
const TIMING = { delay: 500, flip: 700, flag: 0, close: 2200, finish: 2800 };

/** Puzzle 3: set the three knobs, then pour - the tank gets (first x second - third) units and has to hold exactly 71. */
export default function Puzzle3({ onSolve }: { onSolve: () => void }) {
  const frame = usePuzzleFrame(onSolve, { timing: TIMING });
  const [values, setValues] = useState([0, 0, 0]);
  const [steps, setSteps] = useState([0, 0, 0]);
  const [fuel, setFuel] = useState(0);
  const [failed, setFailed] = useState(false);
  const [turns] = useState(() => [new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]);
  const [level] = useState(() => new Animated.Value(0));
  const busy = useRef(false);

  const reset = () => {
    setValues([0, 0, 0]);
    setSteps([0, 0, 0]);
    turns.forEach(turn => turn.setValue(0));
    level.setValue(0);
    setFuel(0);
    setFailed(false);
    busy.current = false;
  };

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKnob = (knob: number) => {
    if (failed || frame.solved || busy.current) return;
    const row = KNOBS[knob];
    const nextSteps = [...steps];
    nextSteps[knob] += 1;
    playAnimation(turns[knob], nextSteps[knob], 200, Easing.linear, false);
    const nextValues = [...values];
    nextValues[knob] = row[(row.findIndex(value => value === values[knob]) + 1) % row.length];
    setSteps(nextSteps);
    setValues(nextValues);
  };

  const onPour = () => {
    if (failed || frame.solved || busy.current) return;
    const amount = values[0] * values[1] - values[2];
    setFuel(amount);
    playAnimation(level, Math.min(Math.max(amount, 0), 100), 250, Easing.linear, false);
    busy.current = true;
    if (amount === TARGET) {
      frame.celebrate();
    } else {
      frame.later(() => {
        setFailed(true);
      }, 250);
      frame.later(reset, 1000);
    }
  };

  const tint = failed ? '#DC4444FF' : '#3b4955';

  return (
    <Animated.View style={[styles.parentLayout, { width: frame.width, overflow: failed ? 'visible' : 'hidden' }]}>
      <View style={styles.tankWrapper}>
        <View style={{ width: '100%', height: '15%' }}>
          <CustomText
            bold
            variant="text"
            noDefaultMargin
            center
            color="#4b5965"
            text={`${TARGET}`}
            style={{ position: 'absolute', left: `${TARGET - 2}%`, top: 0 }}
          />
        </View>
        <View style={styles.tank}>
          <View
            style={{
              position: 'absolute',
              left: `${TARGET}%`,
              height: '100%',
              width: '0%',
              borderWidth: scale(1),
              borderColor: '#3b4955',
              borderStyle: 'dashed',
            }}
          />
          <View
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              borderWidth: scale(3),
              borderColor: tint,
              borderRadius: scale(40),
            }}
          />
          <Animated.View
            style={{
              position: 'absolute',
              height: '100%',
              width: level.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
              backgroundColor: tint,
            }}
          />
          <Animated.View style={{ opacity: frame.flip.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }}>
            <CustomText
              variant="h5"
              bold
              noDefaultMargin
              center
              white
              text={`${fuel}`}
              style={{ height: '100%', lineHeight: (BOARD_W * 0.8) / 5 }}
            />
          </Animated.View>
          <Animated.View style={styles.checkWrapper}>
            <Animated.View style={{ opacity: frame.flip }}>
              <Check size={scale(26)} color="white" />
            </Animated.View>
          </Animated.View>
        </View>
      </View>
      <View style={styles.knobs}>
        {values.map((value, knob) => (
          <View key={knob} style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Animated.View
              style={[
                styles.knobWrapper,
                { transform: [{ rotateZ: turns[knob].interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) }] },
              ]}>
              <CustomButton activeOpacity={0.6} sound={TILE_SOUND} onPress={() => onKnob(knob)} style={styles.knob}>
                <View style={styles.dot} />
              </CustomButton>
            </Animated.View>
            <View pointerEvents="none" style={{ position: 'absolute' }}>
              <CustomText bold noDefaultMargin white text={`${value}`} />
            </View>
          </View>
        ))}
      </View>
      <CustomButton activeOpacity={0.6} sound={TILE_SOUND} onPress={onPour} style={styles.pour} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  parentLayout: {
    width: BOARD_W,
    height: BOARD_W * 0.8,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: scale(0),
    borderColor: 'red',
  },
  tankWrapper: { position: 'absolute', top: 0, justifyContent: 'space-between', width: TANK_W, aspectRatio: 3 },
  tank: { width: '100%', height: '70%', borderRadius: scale(40), overflow: 'hidden' },
  checkWrapper: { position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  knobs: {
    position: 'absolute',
    bottom: BOARD_W * 0.18,
    width: TANK_W,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    borderWidth: scale(0),
    borderColor: 'blue',
  },
  knobWrapper: { width: KNOB_SIZE, aspectRatio: 1, borderRadius: scale(100), overflow: 'hidden' },
  knob: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#3b4955' },
  dot: {
    position: 'absolute',
    top: '10%',
    width: '12%',
    aspectRatio: 1,
    borderRadius: scale(100),
    backgroundColor: '#000000AA',
  },
  pour: {
    position: 'absolute',
    bottom: 0,
    width: BOARD_W * 0.45,
    aspectRatio: 3,
    backgroundColor: '#3b4955',
    borderRadius: scale(30),
  },
});
