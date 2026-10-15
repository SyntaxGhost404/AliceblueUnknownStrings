import React, { useContext, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { getAppImage } from '../../assets/images';
import { GlobalContext } from '../../state/GlobalProvider';
import { isActiveInSession } from '../../content';
import { getAppString } from '../../content/appStrings';
import { PixabowlPost, pixabowlPosts, pixabowlStrings, SELF_USER } from '../../content/mock/pixabowl';
import { PhoneName } from '../../content/types';
import Header from './Header';
import PostModal from './PostModal';
import { getAvatar, getUser } from './feedData';

type Props = { phone: PhoneName; route: any; setNotiBarColor: (c: string) => void };

/** A user's profile: counts, name, bio and a grid of their posts (tap one to open it). */
export default function Profile({ phone, route, setNotiBarColor }: Props) {
  const { session } = useContext(GlobalContext);
  const colors = (theme as any)[phone].pixabowl.colors;
  const userId: string = route.params?.user ?? SELF_USER;
  const user = getUser(userId);
  const [post, setPost] = useState<PixabowlPost | null>(null);
  const posts = useMemo(
    () => pixabowlPosts.filter(p => p.user === userId && isActiveInSession(session, p.start, p.end)),
    [userId, session],
  );

  return (
    <View style={[styles.parentLayout, { backgroundColor: colors.background }]}>
      <Header phone={phone} showBack setNotiBarColor={setNotiBarColor} />
      <View style={styles.profileBar}>
        <CustomImage style={{ borderRadius: scale(100) }} width="20%" aspectRatio={1} source={getAvatar(userId)} />
        <View style={{ flexDirection: 'row', width: '75%', justifyContent: 'flex-end' }}>
          <View style={styles.barSection}>
            <CustomText bold noDefaultMargin white variant="subtext" text={posts.length} />
            <CustomText noDefaultMargin white variant="subtext" text={getAppString('herphone', 'pixabowl', 'posts')} />
          </View>
          <View style={styles.barSection}>
            <CustomText bold noDefaultMargin white variant="subtext" text={user?.followers} />
            <CustomText noDefaultMargin white variant="subtext" text={pixabowlStrings.followers} />
          </View>
          <View style={styles.barSection}>
            <CustomText bold noDefaultMargin white variant="subtext" text={user?.following} />
            <CustomText noDefaultMargin white variant="subtext" text={pixabowlStrings.following} />
          </View>
        </View>
      </View>
      <CustomText bold noDefaultMargin style={{ marginLeft: theme.padding as any }} white variant="text" text={user?.full_name} />
      <CustomText style={{ marginLeft: theme.padding as any }} white variant="caption" text={user?.bio} />
      <View style={[styles.bar, { backgroundColor: colors.bar }]}>
        <Entypo name="grid" size={scale(25)} color={theme.colors.white} style={{ paddingHorizontal: '2%' }} />
      </View>
      <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
        {posts.length === 0 ? (
          <CustomText white center text={pixabowlStrings.no_posts} />
        ) : (
          <View style={styles.posts}>
            {posts.map(p => (
              <CustomButton key={p.id} style={styles.post} activeOpacity={0.8} onPress={() => setPost(p)}>
                <CustomImage width="100%" height="100%" source={getAppImage('pixabowl', p.image)} />
              </CustomButton>
            ))}
          </View>
        )}
      </ScrollView>
      <PostModal phone={phone} data={post} setPost={setPost} />
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, width: '100%', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' },
  profileBar: {
    width: '100%',
    paddingHorizontal: theme.padding as any,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4%',
    marginBottom: '2%',
  },
  barSection: { alignItems: 'center', marginLeft: '10%' },
  bar: { alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: '2%' },
  posts: { flexDirection: 'row', width: '100%', flexWrap: 'wrap' },
  post: { width: '33.3%', padding: '0.1%', aspectRatio: 1, borderRadius: scale(0), overflow: 'hidden' },
});
