import React, { useContext } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FastForward } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { GlobalContext } from '../../state/GlobalProvider';
import { getEpisode, isActiveInSession } from '../../content';
import { recaps } from '../../content/mock/archive';
import Header from './Header';

const { height: H } = Dimensions.get('screen');
const ACCENT = '#89B1C3';
const MUTED = '#5E7B88';

/** Episode recaps unlocked so far, one tile per episode starting with episode 1. */
export default function Recaps() {
  const navigation = useNavigation<any>();
  const { session } = useContext(GlobalContext);

  return (
    <View style={[styles.parentLayout, { backgroundColor: theme.myphone.archive.colors.background }]}>
      <Header title="Recaps" showBack />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.recaps} onStartShouldSetResponder={() => true}>
          {recaps.map((recap, index) => ({ recap, index })).filter(({ recap }) => isActiveInSession(session, recap.start)).map(
            ({ recap, index }) => (
              <CustomButton
                key={index}
                style={styles.recap}
                onPress={() => navigation.navigate('recap', { data: { number: index + 1, ...recap } })}>
                <View style={styles.left}>
                  <CustomText gameText noDefaultMargin color={ACCENT} style={{ fontSize: scale(64), marginBottom: scale(8) }} text={index + 1} />
                </View>
                <View style={styles.right}>
                  <CustomText bold noDefaultMargin color={ACCENT} variant="h4" text={'Episode ' + (index + 1)} />
                  <CustomText color={MUTED} variant="subtext" text={getEpisode(index + 1)?.title} />
                  <View style={styles.label}>
                    <CustomText
                      bold
                      noDefaultMargin
                      color={MUTED}
                      variant="caption"
                      text="Recap"
                      style={{ marginBottom: '1.5%', marginRight: '1.5%' }}
                    />
                    <FastForward fill={MUTED} color="none" size={scale(14)} />
                  </View>
                </View>
              </CustomButton>
            ),
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, flexDirection: 'column' },
  scroll: { width: '100%', padding: '5%' },
  recaps: { width: '100%' },
  recap: {
    height: H * 0.15,
    width: '100%',
    backgroundColor: '#020F14',
    borderRadius: scale(20),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '2%',
  },
  left: {
    height: '100%',
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: scale(2),
    borderRightColor: '#071920',
  },
  right: { height: '100%', width: '80%', justifyContent: 'center', alignItems: 'flex-start', paddingLeft: '6%' },
  label: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: '0.5%',
    paddingHorizontal: '4%',
    borderRadius: scale(100),
    backgroundColor: '#071920',
    marginTop: '1%',
  },
});
