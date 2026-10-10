import React, { useContext, useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import CustomText from '../../components/CustomText';
import { GlobalContext } from '../../state/GlobalProvider';
import { getEpisode } from '../../content';
import { playAnimation } from '../../theme/animation';
import { isGameScreen, MainStackParamList } from '../../navigation/types';

type Props = StackScreenProps<MainStackParamList, 'episode'>;

/** "Episode N" card: number, then the episode name, then straight into the game. */
export default function EpisodeScreen({ navigation }: Props) {
  const { session } = useContext(GlobalContext);
  const [numberAnim] = useState(() => new Animated.Value(0));
  const [titleAnim] = useState(() => new Animated.Value(0));
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (!session) return;
    setTitle(getEpisode(session.episode)?.title ?? '');
  }, [session]);

  useEffect(() => {
    if (title === '' || !session) return;
    const fade = 800;
    const hold = 3000;
    playAnimation(numberAnim, 1, fade);
    const showTitle = setTimeout(() => playAnimation(titleAnim, 1, fade), fade);
    const leave = setTimeout(() => {
      const launch = getEpisode(session.episode)?.launch ?? 'myphone';
      if (isGameScreen(launch)) navigation.replace('game', { screen: launch });
      else navigation.replace(launch as any);
    }, fade + hold);
    return () => {
      clearTimeout(showTitle);
      clearTimeout(leave);
    };
    // Runs once per episode title, like the reference build.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  return (
    <View style={styles.parentLayout}>
      <Animated.View style={{ opacity: numberAnim }}>
        <CustomText variant="h1" style={{ fontFamily: 'JosefinSans-Regular' }} accent text={'Episode ' + session?.episode} />
      </Animated.View>
      <Animated.View style={{ opacity: titleAnim }}>
        <CustomText variant="h3" style={{ fontFamily: 'JosefinSans-Regular' }} accent text={title} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
});
