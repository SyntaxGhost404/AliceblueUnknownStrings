import React, { useContext, useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Pin } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { playAnimation } from '../../theme/animation';
import { GlobalContext } from '../../state/GlobalProvider';
import { useGameUI } from '../../navigation/GameUIContext';
import { NoteData } from '../../content/mock/notes';
import { PhoneName } from '../../content/types';
import DeleteButton from './DeleteButton';

const { width: W } = Dimensions.get('screen');

type Props = { phone: PhoneName; data: NoteData };

/** A note card in the grid: tap to open, pin to float it on the home screen, trash to delete. */
export default function NoteItem({ phone, data }: Props) {
  const { setNotes } = useContext(GlobalContext);
  const { setFloatingNote } = useGameUI();
  const navigation = useNavigation<any>();
  const opacity = useRef(new Animated.Value(0)).current;
  const shown = useRef(false);

  // Fades in once the delete button has measured itself (with a fallback so a card never stays hidden).
  const onLoad = () => {
    if (shown.current) return;
    shown.current = true;
    playAnimation(opacity, 1, 800);
  };
  useEffect(() => {
    const fallback = setTimeout(onLoad, 1500);
    return () => clearTimeout(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPin = () => {
    navigation.popTo('homescreen');
    setFloatingNote(data);
  };

  const onConfirmDelete = () => {
    (setNotes as any)((prev: NoteData[] | null) => (prev ?? []).filter(n => n.id !== data.id));
  };

  return (
    <Animated.View style={[styles.note, { opacity }]}>
      <CustomButton style={styles.noteButton} onPress={() => navigation.navigate('note', { data })}>
        <View style={styles.actions}>
          <View style={styles.pin}>
            <CustomButton style={styles.button} onPress={onPin}>
              <Pin color={theme.myphone.notes.colors.accent} size={scale(22)} strokeWidth={1.5} />
            </CustomButton>
          </View>
          <DeleteButton phone={phone} onLoad={onLoad} onConfirmDelete={onConfirmDelete} />
        </View>
        <CustomText style={{ paddingHorizontal: '3%' }} color={theme.colors.darkGray} variant="subtext" text={data.text} />
      </CustomButton>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  note: { width: '100%', borderRadius: scale(6), backgroundColor: '#171717', marginTop: W * 0.94 * 0.04 },
  noteButton: { width: '100%', justifyContent: 'space-between', padding: '6%', paddingBottom: '12%' },
  actions: { width: '100%', flexDirection: 'row', marginBottom: '5%' },
  pin: { marginRight: '2%', backgroundColor: 'transparent', borderRadius: scale(4), justifyContent: 'center' },
  button: { flexDirection: 'row', backgroundColor: 'transparent', alignItems: 'center', padding: '3%' },
});
