import React, { useContext } from 'react';
import { Dimensions, I18nManager, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import CustomText from '../../components/CustomText';
import { GlobalContext } from '../../state/GlobalProvider';
import { isActiveInSession } from '../../content';
import { boardLines, markings } from '../../content/mock/desk';

const { width: W, height: H } = Dimensions.get('screen');
const STROKE_WIDTH = '1.5';
const LINECAP = 'round';
/** The string's drop shadow bows a little further than the string itself. */
const SHADOW_OFFSET = 10;

/** Height of a board photo (23% wide, 0.88 aspect) — handwriting is offset in multiples of it. */
const PHOTO_H = (W * 0.23) / 0.88;

const linePath = (l: (typeof boardLines)[number], offset: number) => {
  const x1 = (W * l.m1) / 100;
  const y1 = (H * l.m2) / 100 + (((W * l.mw) / 100 / l.mar) * l.mp) / 100;
  const cx = (W * l.q1) / 100 + offset;
  const cy = (H * l.q2) / 100 + offset;
  const x2 = (W * l.q3) / 100;
  const y2 = (H * l.q4) / 100 + (((W * l.qw) / 100 / l.qar) * l.qp) / 100;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
};

/**
 * Handwriting and red string pinned over the board photos. Purely decorative: touches pass
 * through to the photos underneath.
 */
export default function Markings() {
  const { session } = useContext(GlobalContext);
  const activeMarkings = markings.filter(m => isActiveInSession(session, m.start, m.end));
  const activeLines = boardLines.filter(l => isActiveInSession(session, l.start, l.end));

  return (
    <View style={styles.parentLayout} pointerEvents="none">
      {activeMarkings.map(m => (
        <CustomText
          key={m.text + m.x + m.y}
          variant={m.variant ?? 'text'}
          text={m.text + ' '}
          color={m.color ?? '#FFFFFFBB'}
          style={{
            paddingHorizontal: '1%',
            fontFamily: 'Caveat-Regular',
            position: 'absolute',
            left: m.x as any,
            top: (parseFloat(m.y.replace('%', '')) * H) / 100 + (m.p ? (PHOTO_H * m.p) / 100 : 0),
            textAlign: 'center',
            transform: [{ rotateZ: m.rotate }],
          }}
        />
      ))}
      <Svg
        width="100%"
        height="100%"
        fill="transparent"
        color="#AE091ECC"
        style={{ transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }] }}>
        {activeLines.map((l, i) => (
          <React.Fragment key={i}>
            <Path d={linePath(l, SHADOW_OFFSET)} stroke="#000000AA" strokeLinecap={LINECAP} strokeWidth={STROKE_WIDTH} />
            <Path
              d={linePath(l, 0)}
              stroke={l.color ?? 'currentColor'}
              strokeLinecap={LINECAP}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={l.dash ? '6, 6' : 'none'}
            />
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { position: 'absolute', width: '100%', height: '100%' },
});
