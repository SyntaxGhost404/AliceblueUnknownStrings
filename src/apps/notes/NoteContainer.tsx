import React from 'react';
import { StyleSheet, View } from 'react-native';
import theme from '../../theme/theme';
import { PhoneName } from '../../content/types';
import Header from './Header';
import Note from './Note';

type Props = { phone: PhoneName; route: any };

/** The note screen: header ("New Note" / "Edit Note") above a single editable note card. */
export default function NoteContainer({ phone, route }: Props) {
  const { data, isNew, script } = route.params ?? {};

  return (
    <View style={[styles.parentLayout, { backgroundColor: (theme as any)[phone].notes.colors.background }]}>
      <Header phone={phone} showBack title={(isNew ? 'New' : 'Edit') + ' Note'} />
      <View style={styles.noteWrapper}>
        <Note data={data} isNew={isNew} phone={phone} script={script} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noteWrapper: { width: '100%', height: '91%', alignItems: 'center' },
});
