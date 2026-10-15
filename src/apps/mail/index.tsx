import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import theme from '../../theme/theme';
import { AppProps } from '../types';
import Home from './Home';
import MailView from './MailView';

const Stack = createStackNavigator();

/** Mail app: the inbox and a mail opened over it (a notification opens its mail directly). */
export default function Mail({ phone, navigation, route, setNotiBarColor }: AppProps) {
  useFocusEffect(
    useCallback(() => {
      setNotiBarColor((theme as any)[phone].mail.colors.notificationBar);
    }, [phone, setNotiBarColor]),
  );

  const mailId = route.params?.params?.email ?? route.params?.email;
  useEffect(() => {
    if (mailId) navigation.navigate('mailview', { email: mailId });
  }, [mailId, navigation]);

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
          {(props: any) => <Home {...props} phone={phone} setNotiBarColor={setNotiBarColor} />}
        </Stack.Screen>
        <Stack.Screen name="mailview">
          {(props: any) => <MailView {...props} phone={phone} setNotiBarColor={setNotiBarColor} />}
        </Stack.Screen>
      </Stack.Navigator>
    </View>
  );
}
