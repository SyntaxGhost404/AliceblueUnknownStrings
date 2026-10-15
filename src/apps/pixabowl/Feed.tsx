import React, { useContext, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { GlobalContext } from '../../state/GlobalProvider';
import { getAppString } from '../../content/appStrings';
import { PhoneName } from '../../content/types';
import Header from './Header';
import Post from './Post';
import { getFeed } from './feedData';

type Props = { phone: PhoneName; setNotiBarColor: (c: string) => void };

/** The feed: posts released so far, one after another with thin dividers. */
export default function Feed({ phone, setNotiBarColor }: Props) {
  const { session, date, time } = useContext(GlobalContext);
  const posts = useMemo(() => getFeed(session, date, time), [session, date, time]);

  return (
    <View style={[styles.parentLayout, { backgroundColor: (theme as any)[phone].pixabowl.colors.background }]}>
      <Header phone={phone} showProfile setNotiBarColor={setNotiBarColor} />
      <CustomText
        style={{ marginHorizontal: theme.padding as any, fontFamily: 'IndieFlower-Regular', marginTop: '3%' }}
        noDefaultMargin
        bold
        variant="h4"
        color={theme.colors.darkGray}
        text={getAppString('herphone', 'pixabowl', 'posts')}
      />
      <View style={{ width: '100%', flex: 1 }}>
        <FlashList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: scale(40) }}
          data={posts}
          renderItem={({ item }) => <Post phone={phone} data={item} onClickPerson={() => {}} />}
          keyExtractor={item => item.id}
          ItemSeparatorComponent={Divider}
        />
      </View>
    </View>
  );
}

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  parentLayout: { flex: 1, width: '100%', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' },
  divider: { width: '100%', height: scale(0.5), backgroundColor: '#FFFFFF22', marginVertical: '2%' },
});
