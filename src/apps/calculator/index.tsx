import React, { useCallback, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Delete } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { AppProps } from '../types';
import Header from './Header';

const { width: W } = Dimensions.get('screen');

/** Key kinds: 0 = clear, 1 = operator (incl. sign, back, equals), 2 = operand (digits and the dot). */
type Key = { type: 0 | 1 | 2; title: string };

const keys: Key[] = [
  { type: 0, title: 'C' }, { type: 1, title: '+/-' }, { type: 1, title: '%' }, { type: 1, title: '/' },
  { type: 2, title: '7' }, { type: 2, title: '8' }, { type: 2, title: '9' }, { type: 1, title: '×' },
  { type: 2, title: '4' }, { type: 2, title: '5' }, { type: 2, title: '6' }, { type: 1, title: '-' },
  { type: 2, title: '1' }, { type: 2, title: '2' }, { type: 2, title: '3' }, { type: 1, title: '+' },
  { type: 2, title: '.' }, { type: 2, title: '0' }, { type: 1, title: 'back' }, { type: 1, title: '=' },
];

const operations: Record<string, (a: number, b: number) => number> = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '×': (a, b) => a * b,
  '/': (a, b) => a / b,
  '%': (a, b) => a % b,
};

/** Four-function calculator on Adam's phone: one pending operation, 14 digits per operand. */
export default function Calculator({ navigation, phone, setNotiBarColor }: AppProps) {
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [operator, setOperator] = useState('');
  const colors = (theme as any)[phone].calculator.colors;

  useFocusEffect(
    useCallback(() => {
      setNotiBarColor((theme as any)[phone].calculator.colors.notificationBar);
    }, [phone, setNotiBarColor]),
  );

  const handleClear = () => {
    setFirst('');
    setSecond('');
    setOperator('');
  };

  const handleOperator = (op: string) => {
    if (op === 'back') {
      if (second !== '') setSecond(s => s.slice(0, s.length - 1));
      else if (operator !== '') setOperator('');
      else setFirst(f => f.slice(0, f.length - 1));
      return;
    }
    if (op === '+/-') {
      if (parseFloat(first) !== 0) setFirst(f => (f.startsWith('-') ? f.replace('-', '') : '-' + f));
      return;
    }
    if (operator !== '') {
      if (second === '') return;
      const result = operations[operator](parseFloat(first), parseFloat(second));
      setFirst(parseFloat(result.toFixed(4)).toString());
      setSecond('');
      setOperator(op === '=' ? '' : op);
      return;
    }
    if (op !== '=' && first !== '') setOperator(op);
  };

  const handleOperand = (digit: string) => {
    if (first.length > 14 || second.length > 14) return;
    if (operator !== '') {
      if (second === '' && digit === '0') return;
      setSecond(s => s + digit);
    } else {
      if (first === '' && digit === '0') return;
      setFirst(f => f + digit);
    }
  };

  const handlers = [handleClear, handleOperator, handleOperand];

  return (
    <View style={[styles.parentLayout, { backgroundColor: colors.background }]}>
      <Header navigation={navigation} phone={phone} />
      <View style={styles.content}>
        <View style={styles.answerArea}>
          <CustomText white style={{ fontSize: scale(32) }} text={(first !== '' ? first : '0') + operator + second} />
        </View>
        <View style={styles.buttonsContainer}>
          {keys.map((key, index) => (
            <CustomButton
              key={index}
              style={styles.buttonWrapper}
              onPress={() => handlers[key.type](key.title)}
              activeOpacity={0.6}>
              <View style={[styles.button, { backgroundColor: colors.types[key.type] }]}>
                {key.title === 'back' ? (
                  <Delete style={{ marginRight: '2%' }} size={scale(24)} color={theme.colors.white} />
                ) : (
                  <CustomText
                    bold
                    white
                    variant="h2"
                    style={{ marginBottom: key.type === 1 ? '6%' : '5%' }}
                    text={key.title}
                  />
                )}
              </View>
            </CustomButton>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, flexDirection: 'column', justifyContent: 'space-between', paddingBottom: '4%' },
  content: { width: '100%', alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: '4%' },
  answerArea: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: '8%',
    marginBottom: '2%',
  },
  buttonsContainer: {
    width: '100%',
    height: (W * 0.92 * 5) / 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    opacity: 0.85,
  },
  buttonWrapper: { width: (W * 0.92) / 4.1, aspectRatio: 1, justifyContent: 'center', alignItems: 'center', padding: '1%' },
  button: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(100),
    borderColor: '#00000033',
    borderWidth: scale(1.5),
    borderStyle: 'solid',
  },
});
