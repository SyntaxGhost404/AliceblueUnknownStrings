import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useKeepAwake } from '@sayem314/react-native-keep-awake';
import { GlobalProvider } from './state/GlobalProvider';
import { ContentProvider } from './state/ContentProvider';
import { MusicProvider } from './audio/MusicProvider';
import MainNavigator from './navigation/MainNavigator';

const navigationTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: 'transparent' },
};

function Root() {
  useKeepAwake();
  return (
    <>
      <StatusBar hidden barStyle="light-content" />
      <MainNavigator />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'black' }}>
      <GlobalProvider>
        <MusicProvider>
          <ContentProvider>
            <SafeAreaProvider>
              <NavigationContainer theme={navigationTheme}>
                <Root />
              </NavigationContainer>
            </SafeAreaProvider>
          </ContentProvider>
        </MusicProvider>
      </GlobalProvider>
    </GestureHandlerRootView>
  );
}
