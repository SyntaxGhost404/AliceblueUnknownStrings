import React, { memo, useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { GlobalContext } from '../state/GlobalProvider';
import { phones } from '../content';
import { PhoneName } from '../content/types';
import apps from '../apps';
import LockScreen from './LockScreen';
import HomeScreen from './HomeScreen';

const Stack = createStackNavigator();

/** Screens that swap instantly instead of zooming in like apps do. */
const instantScreens = ['lockscreen', 'homescreen', 'safemode'];

type Props = {
  phone: PhoneName;
  handlePanel: () => void;
  setPhoneOff: (v: boolean) => void;
  topInset: number;
  showPasslock: boolean;
  setShowPasslock: (v: boolean) => void;
  setNotiBarColor: (c: string) => void;
  setIsLockscreen: (v: boolean) => void;
  disableNotiBar: boolean;
  setDisableNotiBar: (v: boolean) => void;
  setRemoveNotiBar: (v: boolean) => void;
  setGlitch: (v: number) => void;
};

/** One phone's navigator: lock screen, home screen and every app, each zooming open. */
function PhoneNavigation(props: Props) {
  const { phone } = props;
  const { locked } = useContext(GlobalContext);

  return (
    <Stack.Navigator
      initialRouteName={locked?.[phone] ? 'lockscreen' : 'homescreen'}
      screenOptions={({ route }: any) => ({
        gestureEnabled: false,
        headerShown: false,
        animation: route.params?.disabledAnim ? 'none' : 'scale_from_center',
        cardStyle: { backgroundColor: 'transparent' },
      })}>
      <Stack.Screen name="lockscreen" options={{ animation: 'none' }}>
        {(screen: any) => (
          <LockScreen
            {...screen}
            phone={phone}
            setPhoneOff={props.setPhoneOff}
            showPasslock={props.showPasslock}
            setShowPasslock={props.setShowPasslock}
            setNotiBarColor={props.setNotiBarColor}
            setIsLockscreen={props.setIsLockscreen}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="homescreen" options={{ animation: 'none' }}>
        {(screen: any) => <HomeScreen {...screen} phone={phone} setNotiBarColor={props.setNotiBarColor} />}
      </Stack.Screen>
      {Object.keys(phones[phone].apps).map(app => {
        const App = apps[app];
        if (!App) return null;
        return (
          <Stack.Screen key={app} name={app} options={{ animation: instantScreens.includes(app) ? 'none' : 'scale_from_center' }}>
            {(screen: any) => (
              <App
                {...screen}
                phone={phone}
                setNotiBarColor={props.setNotiBarColor}
                disableNotiBar={props.disableNotiBar}
                setDisableNotiBar={props.setDisableNotiBar}
                setRemoveNotiBar={props.setRemoveNotiBar}
                setGlitch={props.setGlitch}
              />
            )}
          </Stack.Screen>
        );
      })}
    </Stack.Navigator>
  );
}

export default memo(PhoneNavigation);
