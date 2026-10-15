import React, { useContext } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { getContactImage } from '../../assets/images';
import { GlobalContext } from '../../state/GlobalProvider';
import { isActiveInSession } from '../../content';
import { ArchiveCharacter } from '../../content/mock/archive';
import Header from './Header';
import { getRelation } from './helpers';

const ACCENT = '#89B1C3';

/** Character sheet: portrait, name, relation, and the facts unlocked so far. */
export default function Character({ route }: { route: any }) {
  const { session } = useContext(GlobalContext);
  const character: ArchiveCharacter | undefined = route.params?.data;
  if (!character) return null;
  const relation = getRelation(character.relation);

  return (
    <View style={[styles.parentLayout, { backgroundColor: theme.myphone.archive.colors.background }]}>
      <Header title={character.name} showBack />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View onStartShouldSetResponder={() => true}>
          <View style={styles.top}>
            <CustomImage
              style={{ borderRadius: scale(100), marginRight: '5%' }}
              width="30%"
              aspectRatio={1}
              source={getContactImage(character.portrait)}
            />
            <View>
              <CustomText bold variant="h5" noDefaultMargin color={ACCENT} text={character.name} />
              {relation ? (
                <CustomText noDefaultMargin color="#5E7B88" style={{ marginTop: '4%' }} text={relation} />
              ) : null}
            </View>
          </View>
          <View style={styles.bottom}>
            {character.blocks
              .filter(block => isActiveInSession(session, block.start))
              .map((block, index) => (
                <View key={index} style={styles.block}>
                  <CustomText bold variant="subtext" noDefaultMargin color={ACCENT} text={block.content} />
                </View>
              ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, flexDirection: 'column' },
  scroll: { width: '100%', padding: '5%' },
  top: { width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  bottom: { width: '100%', marginTop: '5%' },
  block: {
    width: '100%',
    paddingHorizontal: '6%',
    paddingVertical: '4%',
    borderRadius: scale(12),
    backgroundColor: '#041116',
    marginBottom: '2%',
  },
});
