import React, { useContext, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowDownAZ,
  ArrowDownZA,
  CalendarArrowDown,
  CalendarArrowUp,
  Search,
  X,
} from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { moderateScale, scale } from '../../theme/scale';
import { playAnimation } from '../../theme/animation';
import { getContactImage } from '../../assets/images';
import { GlobalContext } from '../../state/GlobalProvider';
import Header from './Header';
import { getUnlockedCharacters, shortName, sortCharacters, SortMethod, SortOrder } from './helpers';

const { width: W, height: H } = Dimensions.get('screen');
const ACCENT = '#89B1C3';
const MUTED = '#57727E';
/** Size of the circular sort buttons; the highlight slides between them. */
const SORT_SIZE = H * 0.055;
const HIGHLIGHT_X: Record<SortMethod, number> = { alphabetical: 0, date: SORT_SIZE };
const FLIP: Record<SortOrder, SortOrder> = { az: 'za', za: 'az', oldToNew: 'newToOld', newToOld: 'oldToNew' };

/** Unlocked characters: search box, A-Z / date sorting (tap the active one to flip) and a tile grid. */
export default function Characters() {
  const navigation = useNavigation<any>();
  const { session } = useContext(GlobalContext);
  const unlocked = useMemo(() => getUnlockedCharacters(session), [session]);
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState<SortMethod>('alphabetical');
  const [orders, setOrders] = useState<Record<SortMethod, SortOrder>>({ alphabetical: 'az', date: 'oldToNew' });
  const highlight = useRef(new Animated.Value(0)).current;

  const visible = useMemo(
    () =>
      sortCharacters(unlocked, method, orders[method]).filter(character =>
        character.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [unlocked, method, orders, search],
  );

  const flipSortingOrder = (target: SortMethod) =>
    setOrders(prev => ({ ...prev, [target]: FLIP[prev[target]] }));

  const changeSortingMethod = (target: SortMethod) => {
    setMethod(target);
    playAnimation(highlight, HIGHLIGHT_X[target], 200);
  };

  const onSortPress = (target: SortMethod) => (method !== target ? changeSortingMethod(target) : flipSortingOrder(target));

  const sortColor = (target: SortMethod) => (method === target ? ACCENT : MUTED);
  const AlphabeticalIcon = orders.alphabetical === 'az' ? ArrowDownAZ : ArrowDownZA;
  const DateIcon = orders.date === 'oldToNew' ? CalendarArrowDown : CalendarArrowUp;

  return (
    <View style={[styles.parentLayout, { backgroundColor: theme.myphone.archive.colors.background }]}>
      <Header title="Characters" showBack />
      {unlocked.length !== 0 ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.options}>
            <View style={styles.search}>
              <TextInput
                style={styles.input}
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="visible-password"
                placeholder="Search..."
                placeholderTextColor={MUTED}
                editable
                value={search}
                onChangeText={setSearch}
              />
              <CustomButton
                disabled={search === ''}
                activeOpacity={0.6}
                onPress={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '2%',
                  height: '100%',
                  aspectRatio: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: 1,
                }}>
                {search === '' ? (
                  <Search size={scale(20)} color={MUTED} />
                ) : (
                  <X size={scale(20)} color={ACCENT} />
                )}
              </CustomButton>
            </View>
            <View style={styles.sorter}>
              <Animated.View
                style={{
                  position: 'absolute',
                  height: '100%',
                  aspectRatio: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  transform: [{ translateX: highlight }],
                }}>
                <View style={{ width: '80%', aspectRatio: 1, backgroundColor: '#89B1C333', borderRadius: scale(100) }} />
              </Animated.View>
              <CustomButton style={styles.method} onPress={() => onSortPress('alphabetical')}>
                <AlphabeticalIcon size={scale(20)} color={sortColor('alphabetical')} />
              </CustomButton>
              <CustomButton style={styles.method} onPress={() => onSortPress('date')}>
                <DateIcon size={scale(20)} color={sortColor('date')} />
              </CustomButton>
            </View>
          </View>
          <View style={styles.characters} onStartShouldSetResponder={() => true}>
            {visible.map(character => (
              <CustomButton
                key={character.id}
                style={styles.button}
                onPress={() => navigation.navigate('character', { data: character })}>
                <CustomImage
                  style={{ borderRadius: scale(100) }}
                  width="30%"
                  aspectRatio={1}
                  source={getContactImage(character.portrait)}
                />
                <View style={{ width: '65%', marginLeft: '8%' }}>
                  <CustomText bold variant="text" noDefaultMargin color={ACCENT} text={shortName(character.name)} />
                </View>
              </CustomButton>
            ))}
          </View>
        </ScrollView>
      ) : (
        <CustomText
          white
          center
          text="All the case related characters will show up here."
          style={{ marginTop: '10%', alignSelf: 'center', paddingHorizontal: '10%' }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, flexDirection: 'column' },
  scroll: { width: '100%', padding: '5%' },
  options: {
    width: '100%',
    height: SORT_SIZE,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4%',
  },
  search: {
    width: W * 0.9 - 2 * SORT_SIZE - W * 0.03,
    height: '100%',
    backgroundColor: '#020F14',
    borderRadius: scale(100),
    paddingHorizontal: '5%',
    justifyContent: 'center',
  },
  input: {
    fontSize: moderateScale(14),
    width: '100%',
    fontFamily: 'Quicksand-SemiBold',
    height: '100%',
    paddingHorizontal: 0,
    paddingRight: '17%',
    textAlign: 'left',
    borderRadius: scale(100),
    overflow: 'hidden',
    color: ACCENT,
  },
  sorter: {
    width: 2 * SORT_SIZE,
    height: SORT_SIZE,
    backgroundColor: '#020F14',
    borderRadius: scale(100),
    flexDirection: 'row',
    alignItems: 'center',
  },
  method: {
    width: SORT_SIZE,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(100),
    overflow: 'hidden',
  },
  characters: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  button: {
    width: '49%',
    backgroundColor: '#020F14',
    paddingHorizontal: scale(12),
    paddingVertical: scale(18),
    borderRadius: scale(20),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '2%',
  },
});
