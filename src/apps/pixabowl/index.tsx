import React, { useCallback, useContext } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import CustomImage from '../../components/CustomImage';
import assets from '../../assets';
import theme from '../../theme/theme';
import { GlobalContext } from '../../state/GlobalProvider';
import { isActiveInSession } from '../../content';
import { PIXABOWL_LOGIN } from '../../content/mock/pixabowl';
import { AppProps } from '../types';
import Feed from './Feed';
import Login from './Login';
import Profile from './Profile';
import SecurityQuestion from './SecurityQuestion';
import { PixabowlState } from './feedData';

const Stack = createStackNavigator();

const background = <CustomImage style={{ position: 'absolute' }} width="100%" height="100%" resizeMode="cover" source={assets.pixabowl.background} />;

/** Pixabowl app: login (or security question) until the player is in, then the feed and profiles. */
export default function Pixabowl({ phone, route, setNotiBarColor }: AppProps) {
  const { session, appsData } = useContext(GlobalContext);
  const state: PixabowlState = appsData[phone].apps?.pixabowl ?? {};
  const signedIn = !!state.loggedIn || isActiveInSession(session, PIXABOWL_LOGIN.openFrom);

  useFocusEffect(
    useCallback(() => {
      setNotiBarColor((theme as any)[phone].pixabowl.colors.notificationBar);
    }, [phone, setNotiBarColor]),
  );

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        initialRouteName={signedIn ? 'home' : 'login'}
        screenOptions={{
          gestureEnabled: false,
          headerShown: false,
          cardStyleInterpolator: route.params?.disabledAnim
            ? CardStyleInterpolators.forNoAnimation
            : CardStyleInterpolators.forHorizontalIOS,
          cardStyle: { backgroundColor: 'transparent', opacity: 1 },
        }}>
        <Stack.Screen name="login">
          {(props: any) => (
            <>
              {background}
              <Login {...props} phone={phone} setNotiBarColor={setNotiBarColor} />
            </>
          )}
        </Stack.Screen>
        <Stack.Screen name="security-question">
          {(props: any) => (
            <>
              {background}
              <SecurityQuestion {...props} phone={phone} setNotiBarColor={setNotiBarColor} />
            </>
          )}
        </Stack.Screen>
        <Stack.Screen name="home">
          {(props: any) => (
            <>
              {background}
              <Feed {...props} phone={phone} setNotiBarColor={setNotiBarColor} />
            </>
          )}
        </Stack.Screen>
        <Stack.Screen name="profile">
          {(props: any) => (
            <>
              {background}
              <Profile {...props} phone={phone} setNotiBarColor={setNotiBarColor} />
            </>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </View>
  );
}
