import React, { useContext, useEffect, useState } from 'react';
import { Animated, BackHandler, StyleSheet, View } from 'react-native';
import { createStackNavigator, StackCardInterpolationProps } from '@react-navigation/stack';
import CustomText from '../components/CustomText';
import { GlobalContext } from '../state/GlobalProvider';
import { playAnimation } from '../theme/animation';
import { scale } from '../theme/scale';
import { MainStackParamList } from './types';
import SplashScreen from '../screens/splash/SplashScreen';
import LoginScreen from '../screens/login/LoginScreen';
import TitleScreen from '../screens/title/TitleScreen';
import EpisodeScreen from '../screens/episode/EpisodeScreen';
import GameNavigator from './GameNavigator';

const Stack = createStackNavigator<MainStackParamList>();

const forFade = ({ current }: StackCardInterpolationProps) => ({ cardStyle: { opacity: current.progress } });

/** Root flow: splash → login → title → episode → game, cross-fading between screens. */
export default function MainNavigator() {
  const { subtitle } = useContext(GlobalContext);
  const [subtitleAnim] = useState(() => new Animated.Value(0));

  // The hardware back button never leaves a screen in this game.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (subtitle) playAnimation(subtitleAnim, 1, 400);
  }, [subtitle, subtitleAnim]);

  return (
    <View style={styles.parentLayout}>
      <Stack.Navigator
        initialRouteName="splash"
        screenOptions={{
          gestureEnabled: false,
          headerShown: false,
          cardStyle: { opacity: 1, backgroundColor: 'transparent' },
        }}>
        <Stack.Screen name="splash" component={SplashScreen} options={{ cardStyleInterpolator: forFade }} />
        <Stack.Screen name="login" component={LoginScreen} options={{ cardStyleInterpolator: forFade }} />
        <Stack.Screen name="title" component={TitleScreen} options={{ cardStyleInterpolator: forFade }} />
        <Stack.Screen name="episode" component={EpisodeScreen} options={{ cardStyleInterpolator: forFade }} />
        <Stack.Screen name="game" component={GameNavigator} options={{ cardStyleInterpolator: forFade }} />
      </Stack.Navigator>
      {subtitle ? (
        <Animated.View pointerEvents="none" style={[styles.subtitle, { opacity: subtitleAnim }]}>
          <CustomText noDefaultMargin variant="subtext" center bold white text={subtitle.text} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, backgroundColor: 'black' },
  subtitle: {
    position: 'absolute',
    bottom: '10%',
    backgroundColor: '#00000066',
    paddingHorizontal: '4%',
    paddingVertical: '2%',
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: '90%',
  },
});
