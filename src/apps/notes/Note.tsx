import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  I18nManager,
  Keyboard,
  ScrollView,
  ScrollViewInstance,
  StyleSheet,
  TextInput,
  TextInputInstance,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronDown, Pin, PinOff } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { playAnimation } from '../../theme/animation';
import { playSound } from '../../audio/sound';
import { GlobalContext } from '../../state/GlobalProvider';
import { useGameUI } from '../../navigation/GameUIContext';
import { NoteData, noteScripts } from '../../content/mock/notes';
import { PhoneName } from '../../content/types';
import DeleteButton from './DeleteButton';

const { width: W, height: H } = Dimensions.get('screen');

type Props = {
  phone: PhoneName;
  data?: NoteData | null;
  /** The note was just created from the add button. */
  isNew?: boolean;
  /** Shown as the floating note on the home screen: no delete, a minimize button instead. */
  floating?: boolean;
  minimize?: () => void;
  /** Key of a note script (mock/notes.ts) that types itself into the note. */
  script?: string;
  setFloatingNote?: (note: NoteData | null) => void;
};

/** Delay (ms) between two typed characters of a scripted note. */
const TYPE_INTERVAL = 45;

/** One editable note card: pin, delete, auto-saved text and the optional self-typing script. */
export default function Note({ phone, data, isNew, floating, minimize, script: scriptKey, setFloatingNote: setFloat }: Props) {
  const { setNotes, soundsEnabled, triggerAction } = useContext(GlobalContext);
  const ui = useGameUI();
  const setFloatingNote = setFloat ?? ui.setFloatingNote;
  const navigation = useNavigation<any>();
  const note = data ?? { id: '', text: '' };

  const opacity = useRef(new Animated.Value(floating ? 1 : 0)).current;
  const scroll = useRef<ScrollViewInstance>(null);
  const input = useRef<TextInputInstance>(null);
  const [text, setText] = useState(note.text || '');
  const [saved, setSaved] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [typing, setTyping] = useState(false);
  const textRef = useRef(text);
  textRef.current = text;
  const deletedRef = useRef(false);
  const pendingSave = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef(triggerAction);
  triggerRef.current = triggerAction;

  // Last text written to the list (null: a new note that was never saved).
  const lastSaved = useRef<string | null>(isNew ? null : note.text || '');

  const saveNote = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = null;
    pendingSave.current = false;
    if (deletedRef.current) return;
    const current = textRef.current;
    // A brand-new note stays out of the list until something has been written in it.
    if (current === lastSaved.current || (lastSaved.current === null && current === '')) return;
    lastSaved.current = current;
    (setNotes as any)((prev: NoteData[] | null) => {
      const list = [...(prev ?? [])];
      const index = list.findIndex(n => n.id === note.id);
      if (index === -1) list.push({ id: note.id, text: current });
      else list[index] = { ...list[index], text: current };
      return list;
    });
    setSaved(true);
  };
  const saveRef = useRef(saveNote);
  saveRef.current = saveNote;

  // Auto-save shortly after the text stops changing; leaving the screen flushes it.
  useEffect(() => {
    if (text === lastSaved.current) return;
    pendingSave.current = true;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveRef.current(), 700);
  }, [text]);

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (typeTimer.current) clearTimeout(typeTimer.current);
      if (pendingSave.current) saveRef.current();
    },
    [],
  );

  // Scripted note: after a pause, types the lines one character at a time.
  useEffect(() => {
    const script = scriptKey ? noteScripts[scriptKey] : undefined;
    if (!script || floating) return;
    setTyping(true);
    if (soundsEnabled) playSound('button.mp3');
    const runLine = (line: number, char: number) => {
      const content = script.lines[line] + ' ' + (line === script.lines.length - 2 ? '\n\n' : '');
      if (char !== content.length) {
        setText(prev => prev + content.charAt(char));
        typeTimer.current = setTimeout(() => runLine(line, char + 1), TYPE_INTERVAL);
      } else if (line + 1 < script.lines.length) {
        typeTimer.current = setTimeout(() => runLine(line + 1, 0), script.delays[line + 1]);
      } else {
        setTyping(false);
        if (script.action) triggerRef.current(script.action);
      }
    };
    typeTimer.current = setTimeout(() => runLine(0, 0), script.delays[0]);
  }, [scriptKey, floating]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPin = () => {
    if (floating) {
      setFloatingNote(null);
      return;
    }
    if (pendingSave.current) saveNote();
    navigation.popTo('homescreen');
    setFloatingNote({ ...note, text });
  };

  const onConfirmDelete = () => {
    deletedRef.current = true;
    setDeleted(true);
    (setNotes as any)((prev: NoteData[] | null) => (prev ?? []).filter(n => n.id !== note.id));
    navigation.goBack();
  };

  return (
    <Animated.View
      style={[
        styles.note,
        {
          opacity,
          width: floating ? '100%' : '90%',
          height: floating ? '100%' : H * 0.45,
          marginTop: floating ? 0 : W * 0.94 * 0.04,
          backgroundColor: floating ? 'transparent' : '#171717',
        },
      ]}>
      <View style={[styles.actions, { justifyContent: floating ? 'space-between' : 'flex-start' }]}>
        <View style={styles.pin}>
          <CustomButton style={styles.button} disabled={deleted} onPress={onPin}>
            {floating ? (
              <PinOff color="#EA5B5B" size={scale(26)} strokeWidth={1.5} />
            ) : (
              <Pin color={theme.myphone.notes.colors.accent} size={scale(26)} strokeWidth={1.5} />
            )}
          </CustomButton>
        </View>
        {!floating ? (
          <DeleteButton
            big
            hidden={!!isNew && !saved}
            phone={phone}
            onLoad={() => playAnimation(opacity, 1, 600)}
            onConfirmDelete={onConfirmDelete}
          />
        ) : null}
        {floating ? (
          <View style={styles.minimize}>
            <CustomButton style={styles.button} onPress={minimize}>
              <ChevronDown color={theme.colors.mediumGray} size={scale(26)} strokeWidth={2} />
            </CustomButton>
          </View>
        ) : null}
      </View>
      <ScrollView
        ref={scroll}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => {
          if (typing) scroll.current?.scrollToEnd();
        }}
        style={styles.content}
        onTouchStart={() => input.current?.focus()}>
        <TextInput
          ref={input}
          maxLength={450}
          textAlignVertical="top"
          multiline
          style={[styles.input, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}
          autoCorrect={false}
          autoCapitalize="none"
          placeholder="Type..."
          placeholderTextColor={theme.colors.black3}
          editable={!typing}
          value={text}
          onChangeText={setText}
          onFocus={() => {
            if (typing) Keyboard.dismiss();
          }}
        />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  note: {
    borderRadius: scale(6),
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '6%',
    paddingHorizontal: '4%',
  },
  actions: { width: '100%', flexDirection: 'row', marginBottom: '5%' },
  pin: { marginRight: '2%', backgroundColor: 'transparent', borderRadius: scale(6), justifyContent: 'center' },
  button: { flexDirection: 'row', backgroundColor: 'transparent', alignItems: 'center', padding: '2.5%' },
  minimize: { backgroundColor: 'transparent', borderRadius: scale(4), justifyContent: 'center' },
  content: { width: '100%', paddingHorizontal: '1%' },
  input: {
    fontSize: scale(16),
    width: '100%',
    fontFamily: 'Quicksand-Regular',
    marginRight: '2%',
    textAlign: 'left',
    color: theme.colors.mediumGray,
    padding: 0,
  },
});
