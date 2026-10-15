import React, { useContext, useEffect, useState } from 'react';
import { Animated, Easing, I18nManager, Image, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { createAnimation } from '../../theme/animation';
import { getAppImage } from '../../assets/images';
import { GlobalContext } from '../../state/GlobalProvider';
import { getAppString } from '../../content/appStrings';
import { PixabowlPost } from '../../content/mock/pixabowl';
import { PhoneName } from '../../content/types';
import { getAvatar, getUser, PixabowlState } from './feedData';

type Props = {
  phone: PhoneName;
  data: PixabowlPost;
  /** Called after the player taps a name or avatar (on top of opening that profile). */
  onClickPerson: () => void;
};

// Names open with a direction mark so right-to-left layouts keep the handle readable.
const commenterName = (user: string) => `${I18nManager.isRTL ? '‏' : '‎'}${getUser(user)?.name ?? user}`;

/** One post: author, caption, picture (a clue when the story asks for it), likes and top comments. */
export default function Post({ phone, data, onClickPerson }: Props) {
  const navigation = useNavigation<any>();
  const { gatherInfos, handleGatherInfo, appsData, updateAppState } = useContext(GlobalContext);
  const state: PixabowlState = appsData[phone].apps?.pixabowl ?? {};
  const liked = !!state.liked?.[data.id];
  const [pulse] = useState(() => new Animated.Value(1));
  const gatherId = `pixabowl:${data.id}`;
  const canGather = !!gatherInfos?.some(info => info.id === gatherId);
  const source = getAppImage('pixabowl', data.image) as any;
  const author = getUser(data.user);

  // A clue picture pulses until it is tapped.
  useEffect(() => {
    pulse.setValue(1);
    if (!canGather) return;
    const loop = Animated.loop(
      Animated.sequence([createAnimation(pulse, 0.4, 900, Easing.linear), createAnimation(pulse, 1, 900, Easing.linear)]),
    );
    loop.start();
    return () => {
      loop.stop();
      pulse.setValue(1);
    };
  }, [canGather, data.id, pulse]);

  const openProfile = (user: string) => {
    navigation.navigate('profile', { user });
    onClickPerson();
  };

  const onLike = () =>
    updateAppState(phone, 'pixabowl', (prev: PixabowlState) => ({
      ...prev,
      liked: { ...(prev.liked ?? {}), [data.id]: !prev.liked?.[data.id] },
    }));

  return (
    <CustomButton silent activeOpacity={1} style={[styles.post, { borderColor: (theme as any).herphone.pixabowl.colors.divider }]}>
      <CustomButton style={styles.user} activeOpacity={0.6} onPress={() => openProfile(data.user)}>
        <CustomImage style={{ borderRadius: scale(100) }} width="8%" aspectRatio={1} source={getAvatar(data.user)} />
        <CustomText
          style={{ marginLeft: '2%', marginBottom: '1.5%' }}
          noDefaultMargin
          bold
          white
          variant="h5"
          text={author?.name ?? data.user}
        />
      </CustomButton>
      <CustomText style={{ marginBottom: '2%' }} variant="subtext" noDefaultMargin white text={data.caption} />
      <CustomButton
        disabled={!canGather}
        onPress={() => {
          pulse.setValue(1);
          handleGatherInfo(gatherId);
        }}
        activeOpacity={0.6}
        style={{ width: '100%', aspectRatio: 1, marginVertical: '2%' }}>
        <Animated.View style={[styles.picture, { opacity: pulse }]}>
          <Image
            style={{ width: '100%', height: '100%', opacity: 0.3, transform: [{ scale: 1.6 }] }}
            source={source}
            blurRadius={4}
          />
          <CustomImage style={{ position: 'absolute' }} width="100%" aspectRatio={1} resizeMode="contain" source={source} />
        </Animated.View>
      </CustomButton>
      <View style={styles.actions}>
        <View style={{ flexDirection: 'row' }}>
          <CustomButton onPress={onLike} activeOpacity={0.6}>
            <Entypo name={liked ? 'heart' : 'heart-outlined'} size={scale(24)} color={theme.colors.red} />
          </CustomButton>
          <CustomText
            onPress={onLike}
            noDefaultMargin
            bold
            style={{ marginLeft: '3%', marginBottom: '0.5%', marginTop: '0%' }}
            white
            variant="subtext"
            text={`${data.likes + (liked ? 1 : 0)} ${getAppString('herphone', 'pixabowl', 'likes')}`}
          />
        </View>
        <CustomText variant="subtext" color="#FFFFFF55" text={data.id} />
      </View>
      {data.topComments.map((comment, index) => (
        <CustomButton key={index} style={styles.comment} activeOpacity={0.6} onPress={() => openProfile(comment.user)}>
          <CustomImage style={{ borderRadius: scale(100) }} width="6%" aspectRatio={1} source={getAvatar(comment.user)} />
          <CustomText
            variant="subtext"
            noDefaultMargin
            style={{ width: '92%', marginLeft: '2%', borderWidth: 0, borderColor: 'red' }}
            white
            bold
            text={commenterName(comment.user)}>
            <CustomText
              variant="caption"
              noDefaultMargin
              style={{ flexGrow: 1, marginTop: '0.5%', marginLeft: '1%' }}
              white
              text={` ${comment.content} `}
            />
          </CustomText>
        </CustomButton>
      ))}
    </CustomButton>
  );
}

const styles = StyleSheet.create({
  post: { width: '100%', paddingHorizontal: '5%', paddingVertical: '2%' },
  user: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: '3%' },
  picture: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginVertical: '2%' },
  comment: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', width: '100%', marginVertical: '2%' },
});
