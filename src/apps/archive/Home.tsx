import React, { useContext } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChartNoAxesGantt, Clapperboard, LucideIcon, UsersRound } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import assets from '../../assets';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { GlobalContext } from '../../state/GlobalProvider';
import { useGameUI } from '../../navigation/GameUIContext';
import { isActiveInSession } from '../../content';
import { archiveCards } from '../../content/mock/archive';
import Header from './Header';

const ICON_COLOR = '#89B1C3';
const icons: Record<string, LucideIcon | undefined> = {
  characters: UsersRound,
  timeline: ChartNoAxesGantt,
  recaps: Clapperboard,
};

/** Archive hub: a grid of cards (tasks, characters, timeline, recaps) that unlock with the story. */
export default function Home() {
  const navigation = useNavigation<any>();
  const { session } = useContext(GlobalContext);
  const { showOverlay } = useGameUI();

  const onCardPress = (id: string) => {
    if (id !== 'timeline') navigation.navigate(id);
    else showOverlay('timeline', true);
  };

  return (
    <View style={[styles.parentLayout, { backgroundColor: theme.myphone.archive.colors.background }]}>
      <Header />
      <ScrollView
        style={styles.scroll}
        scrollIndicatorInsets={{ right: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.cards} onStartShouldSetResponder={() => true}>
          {archiveCards
            .filter(card => isActiveInSession(session, card.start))
            .map(({ id, title }) => {
              const Icon = icons[id];
              return (
                <CustomButton key={id} style={styles.card} onPress={() => onCardPress(id)}>
                  <View style={styles.icon}>
                    {Icon ? (
                      <Icon size={scale(44)} strokeWidth={scale(1.8)} color={ICON_COLOR} />
                    ) : (
                      <CustomImage width="45%" aspectRatio={1} source={assets.archive.diamond} />
                    )}
                  </View>
                  <View style={styles.title}>
                    <CustomText bold center color={ICON_COLOR} variant="text" text={title} />
                  </View>
                </CustomButton>
              );
            })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, flexDirection: 'column' },
  scroll: { maxWidth: '100%' },
  scrollContent: { width: '100%', alignItems: 'center', paddingHorizontal: '5%', paddingTop: '5%', paddingBottom: '10%' },
  cards: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start' },
  card: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#020F14',
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '4%',
  },
  icon: { width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center' },
  title: { width: '100%', paddingVertical: '2%', justifyContent: 'center', alignItems: 'center' },
});
