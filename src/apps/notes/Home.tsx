import React, { useContext, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import theme from '../../theme/theme';
import { GlobalContext } from '../../state/GlobalProvider';
import { useGameUI } from '../../navigation/GameUIContext';
import { initialNotes, NoteData } from '../../content/mock/notes';
import { PhoneName } from '../../content/types';
import Header from './Header';
import NoteItem from './NoteItem';

type Props = { phone: PhoneName };

/** Notes list: two columns of note cards, even-numbered notes on the left. */
export default function Home({ phone }: Props) {
  const { notes, setNotes } = useContext(GlobalContext);
  const { setFloatingNote } = useGameUI();
  // The saved list holds {id, text} notes (the shared context types it as string[]).
  const list = (notes ?? initialNotes) as unknown as NoteData[];

  // A fresh save starts with the default notes.
  useEffect(() => {
    if (notes === null) (setNotes as any)(initialNotes);
  }, [notes, setNotes]);

  // Opening the app takes the floating note off the home screen.
  useEffect(() => {
    setFloatingNote(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.parentLayout, { backgroundColor: (theme as any)[phone].notes.colors.background }]}>
      <Header phone={phone} showAdd />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.grid}>
          <View style={styles.column}>
            {list
              .filter((_, index) => index % 2 === 0)
              .map(note => (
                <NoteItem key={note.id} phone={phone} data={note} />
              ))}
          </View>
          <View style={styles.column}>
            {list
              .filter((_, index) => index % 2 !== 0)
              .map(note => (
                <NoteItem key={note.id} phone={phone} data={note} />
              ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, flexDirection: 'column' },
  scroll: { width: '100%', paddingHorizontal: theme.padding as any, paddingBottom: '4%', alignItems: 'center' },
  grid: { width: '100%', height: '100%', flexDirection: 'row', justifyContent: 'space-between' },
  column: { width: '48%', height: '100%' },
});
