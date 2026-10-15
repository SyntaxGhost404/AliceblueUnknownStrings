import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import CustomImage from '../../components/CustomImage';
import assets from '../../assets';
import theme from '../../theme/theme';
import { AppProps } from '../types';
import Hidden from './Hidden';
import Home from './Home';
import ImageView from './ImageView';

const Stack = createStackNavigator();

const background = (source: any) => (
  <CustomImage style={{ position: 'absolute' }} width="100%" height="100%" resizeMode="cover" source={source} />
);

/** Gallery app: photo grid, the hidden album and the photo viewer, each over its own backdrop. */
export default function Gallery({ phone, route, setNotiBarColor }: AppProps) {
  useFocusEffect(
    useCallback(() => {
      setNotiBarColor((theme as any)[phone].gallery.colors.notificationBar);
    }, [phone, setNotiBarColor]),
  );

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        initialRouteName="home"
        screenOptions={{
          gestureEnabled: false,
          headerShown: false,
          cardStyleInterpolator: route.params?.disabledAnim
            ? CardStyleInterpolators.forNoAnimation
            : CardStyleInterpolators.forHorizontalIOS,
          cardStyle: { backgroundColor: 'transparent', opacity: 1 },
        }}>
        <Stack.Screen name="home">
          {(props: any) => (
            <>
              {background(assets.gallery.background)}
              <Home {...props} phone={phone} setNotiBarColor={setNotiBarColor} />
            </>
          )}
        </Stack.Screen>
        <Stack.Screen name="hidden">
          {(props: any) => (
            <>
              {background(assets.gallery['background-hidden'] ?? assets.gallery.background)}
              <Hidden {...props} phone={phone} setNotiBarColor={setNotiBarColor} />
            </>
          )}
        </Stack.Screen>
        <Stack.Screen name="imageview">
          {(props: any) => (
            <>
              {background(assets.gallery.background)}
              <ImageView {...props} phone={phone} setNotiBarColor={setNotiBarColor} />
            </>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </View>
  );
}
