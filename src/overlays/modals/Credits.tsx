import React, { useEffect, useState } from 'react';
import { Animated, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeftCircle, ExternalLink } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { playAnimation } from '../../theme/animation';
import { scale } from '../../theme/scale';
import { getGeneral } from '../../content/general';
import { credits } from '../../content/mock/modals';
import { useTimers } from './hooks';

/** When each block of the credits fades in (ms): creators, music, voiceovers, then "Back to game". */
const REVEAL_AT = [0, 1200, 2400, 3600, 4800, 8400];
const REVEAL_DURATION = 1200;

const open = (link: string) => {
  if (link) Linking.openURL(link);
};

type Props = {
  /** Opened at the end of an episode: leaving the credits goes on to the "new episode" card. */
  episodeEnd?: boolean;
  onClose: () => void;
  onEpisodeEnd?: () => void;
};

/** Scrolling credits on black: each block fades in after the previous one. */
export default function Credits({ episodeEnd, onClose, onEpisodeEnd }: Props) {
  const later = useTimers();
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [reveal] = useState(() => REVEAL_AT.map(() => new Animated.Value(0)));
  const [createdBy, creators, musicTitle, music, voiceovers, back] = reveal;

  useEffect(() => {
    playAnimation(fadeAnim, 1, 500);
    const timers = REVEAL_AT.map((at, i) => setTimeout(() => playAnimation(reveal[i], 1, REVEAL_DURATION), at));
    return () => timers.forEach(clearTimeout);
  }, [fadeAnim, reveal]);

  const onBack = () => {
    playAnimation(fadeAnim, 0, 500);
    later(() => {
      onClose();
      if (episodeEnd) onEpisodeEnd?.();
    }, 500);
  };

  return (
    <Animated.View style={[styles.parentLayout, { opacity: fadeAnim }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.body} onStartShouldSetResponder={() => true}>
          <Animated.View style={{ opacity: createdBy }}>
            <CustomText
              variant="h3"
              style={{ fontFamily: 'JosefinSans-Bold' }}
              accent
              text={getGeneral('credits', 'created_by')}
            />
          </Animated.View>
          {credits.creators.map((item, i) => (
            <Animated.View key={i} style={{ width: '100%', opacity: creators }}>
              <CustomButton
                onPress={() => open(item.link)}
                activeOpacity={0.6}
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginVertical: '0.2%',
                }}
              >
                <CustomText
                  variant="text"
                  style={{
                    fontFamily: 'JosefinSans-SemiBold',
                    paddingBottom: '2.5%',
                    marginTop: '1%',
                    marginBottom: 0,
                    marginRight: '2%',
                  }}
                  white
                  text={item.name}
                />
                <ExternalLink color={theme.colors.black3} size={scale(14)} />
              </CustomButton>
            </Animated.View>
          ))}
          <Animated.View style={{ opacity: musicTitle }}>
            <CustomText
              variant="h3"
              style={{ fontFamily: 'JosefinSans-Regular', marginTop: '5%' }}
              accent
              text={getGeneral('credits', 'music')}
            />
          </Animated.View>
          <View style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {credits.music.map((item, i) => (
              <Animated.View
                key={i}
                style={{
                  opacity: music,
                  width: '48%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: '2%',
                }}
              >
                <CustomButton
                  onPress={() => open(item.link)}
                  activeOpacity={0.6}
                  style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}
                >
                  <CustomText
                    variant="text"
                    noDefaultMargin
                    style={{ fontFamily: 'JosefinSans-Regular' }}
                    white
                    text={item.name}
                  />
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: '1%' }}>
                    <CustomText
                      style={{ marginRight: '1%' }}
                      variant="caption"
                      noDefaultMargin
                      color={theme.colors.darkGray}
                      text={item.artist}
                    />
                    <ExternalLink style={{ marginTop: '0.6%' }} color={theme.colors.black3} size={scale(10)} />
                  </View>
                </CustomButton>
              </Animated.View>
            ))}
          </View>
          <Animated.View style={{ opacity: voiceovers }}>
            <CustomText
              variant="h3"
              style={{ fontFamily: 'JosefinSans-Regular', marginTop: '5%' }}
              accent
              text={getGeneral('credits', 'voiceovers')}
            />
          </Animated.View>
          <View style={{ width: '85%', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {credits.voiceovers.map((item, i) => (
              <Animated.View
                key={i}
                style={{
                  opacity: voiceovers,
                  width: '48%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: '2%',
                }}
              >
                <CustomButton
                  activeOpacity={0.6}
                  style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: '1%' }}
                >
                  <CustomText
                    variant="text"
                    noDefaultMargin
                    style={{ fontFamily: 'JosefinSans-Regular' }}
                    white
                    text={item.name}
                  />
                  <CustomText variant="caption" noDefaultMargin color={theme.colors.darkGray} text={item.artist} />
                </CustomButton>
              </Animated.View>
            ))}
          </View>
          <Animated.View style={{ opacity: back, marginTop: '6%' }}>
            <CustomButton onPress={onBack} activeOpacity={0.6} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ArrowLeftCircle color={theme.colors.darkerGray} size={scale(22)} />
              <CustomText
                noDefaultMargin
                variant="h5"
                color={theme.colors.darkerGray}
                style={{ fontFamily: 'JosefinSans-Regular', marginLeft: scale(15.2), paddingTop: 0, paddingBottom: '1%' }}
                text={getGeneral('credits', 'back_to_game')}
              />
            </CustomButton>
          </Animated.View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { position: 'absolute', width: '100%', height: '100%', backgroundColor: '#000000' },
  scroll: { paddingVertical: '20%' },
  body: { width: '100%', alignItems: 'center' },
});
