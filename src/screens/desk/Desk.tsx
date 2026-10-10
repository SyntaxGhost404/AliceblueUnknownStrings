import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomImage from '../../components/CustomImage';
import assets from '../../assets';

/** Detective's desk (being ported). */
export default function Desk() {
  return (
    <View style={styles.parentLayout}>
      <CustomImage width="100%" height="100%" resizeMode="cover" source={assets.suspectboard.table} />
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, backgroundColor: '#000' },
});
