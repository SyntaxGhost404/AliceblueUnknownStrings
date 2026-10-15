import React from 'react';
import { Dimensions, Linking, ScrollView, StyleSheet, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import assets from '../../assets';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import Header from './Header';

const { width: W } = Dimensions.get('screen');
const ACCENT = '#89B1C3';

/** One episode recap: a "watch" button to the recap video and the written summary. */
export default function Recap({ route }: { route: any }) {
  const data = route.params?.data;
  if (!data) return null;

  return (
    <View style={[styles.parentLayout, { backgroundColor: theme.myphone.archive.colors.background }]}>
      <Header title={'Episode ' + data.number + ' Recap'} showBack />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.recap} onStartShouldSetResponder={() => true}>
          {data.video ? (
            <CustomButton style={styles.watch} onPress={() => Linking.openURL(data.video).catch(() => {})}>
              <CustomText noDefaultMargin bold color={ACCENT} variant="text" text="Watch Recap" />
              <View style={styles.youtube}>
                <CustomImage resizeMode="contain" width={W * 0.25} aspectRatio={3.72727} source={assets.archive.youtube} />
              </View>
            </CustomButton>
          ) : null}
          <View style={styles.summary}>
            <CustomText noDefaultMargin color={ACCENT} bold variant="h5" text="Summary" />
            <CustomText noDefaultMargin style={{ marginTop: '2%' }} color={ACCENT} variant="subtext" text={data.summary} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, flexDirection: 'column' },
  scroll: { width: '100%', padding: '5%', paddingBottom: '10%' },
  recap: { width: '100%' },
  watch: {
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '4%',
    paddingLeft: '6%',
    paddingVertical: '3%',
    borderRadius: scale(100),
    backgroundColor: '#020F14',
  },
  youtube: {
    paddingVertical: '2%',
    paddingHorizontal: '4%',
    marginLeft: '4%',
    borderRadius: scale(100),
    backgroundColor: '#071920',
  },
  summary: {
    marginTop: '4%',
    paddingHorizontal: '6%',
    paddingVertical: '4%',
    borderRadius: scale(20),
    backgroundColor: '#020F14',
  },
});
