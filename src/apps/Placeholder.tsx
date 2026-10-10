import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { getGeneral } from '../content/general';
import { AppProps } from './types';

/** Temporary stand-in for an app that hasn't been ported yet. */
export function makePlaceholderApp(app: string) {
  return function PlaceholderApp({ navigation, setNotiBarColor }: AppProps) {
    useFocusEffect(
      useCallback(() => {
        setNotiBarColor('#000');
      }, [setNotiBarColor]),
    );
    return (
      <View style={styles.parentLayout}>
        <CustomText white bold variant="h4" text={getGeneral('apps', app)} />
        <CustomButton onPress={() => navigation.goBack()}>
          <CustomText gray text="Back" />
        </CustomButton>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
});
