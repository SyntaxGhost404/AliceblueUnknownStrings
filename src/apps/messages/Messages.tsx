import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import CustomImage from '../../components/CustomImage';
import theme from '../../theme/theme';
import { getAppImage } from '../../assets/images';
import { AppProps } from '../types';
import Home from './Home';
import Chat from './Chat';

const Stack = createStackNavigator();

/** Messages app: conversation list and chat screens sliding over a shared wallpaper. */
export default function Messages({ phone, navigation, route, setNotiBarColor }: AppProps) {
  useFocusEffect(
    useCallback(() => {
      setNotiBarColor((theme as any)[phone].messages.colors.notificationBar);
    }, [phone, setNotiBarColor]),
  );

  useEffect(() => {
    if (route.params?.person) navigation.navigate('chat', { person: route.params.person });
  }, [route.params, navigation]);

  const background = (
    <CustomImage style={{ position: 'absolute' }} width="100%" height="100%" resizeMode="cover" source={getAppImage('messages', 'background')} />
  );

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        initialRouteName="home"
        screenOptions={{
          gestureEnabled: false,
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          cardStyle: { backgroundColor: 'transparent', opacity: 1 },
        }}>
        <Stack.Screen name="home">
          {(props: any) => (
            <>
              {background}
              <Home {...props} phone={phone} setNotiBarColor={setNotiBarColor} />
            </>
          )}
        </Stack.Screen>
        <Stack.Screen name="chat">
          {(props: any) => (
            <>
              {background}
              <Chat {...props} phone={phone} setNotiBarColor={setNotiBarColor} />
            </>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </View>
  );
}
