import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import moment from 'moment';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import assets from '../../assets';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { playAnimation } from '../../theme/animation';
import { playSound } from '../../audio/sound';
import { GlobalContext } from '../../state/GlobalProvider';
import { getAppString } from '../../content/appStrings';
import { getDiary } from '../../content/mock/diary';
import { PhoneName } from '../../content/types';
import Header from './Header';
import Page, { DiaryEntry } from './Page';

const { width: W, height: H } = Dimensions.get('screen');

const DATE_FORMAT = 'MMM Do, YYYY';
const PAGES_PER_SLIDE = 4;
const OPEN_DURATION = 500;
const PAGES_W = W * 0.77;
const PAGES_H = H * 0.91 * 0.75;
const PAGE_W = PAGES_W * 0.45;
const PAGE_H = PAGES_H * 0.46;

/** `hh:mm:ss.mmm` to seconds. */
const getSeconds = (time: string) => {
  const [hours, minutes, seconds] = time.split(':').map(parseFloat);
  return hours * 3600 + minutes * 60 + seconds;
};

/** 0 = not reached yet, 1 = reached (riddle locked), 2 = story has moved past it (unlocked). */
function pageState(session: { episode: number; objective: number; checkpoint: number }, start: number[]): 0 | 1 | 2 {
  if (session.episode > start[0]) return 2;
  if (session.episode !== start[0]) return 0;
  if (session.objective > start[1]) return 2;
  if (session.objective !== start[1]) return 0;
  return session.checkpoint > start[2] ? 2 : 1;
}

type Props = { phone: PhoneName; setDisableNotiBar: (v: boolean) => void };

/** Diary list: twelve pages, four to a slide; opening one grows it to full screen. */
export default function Home({ phone, setDisableNotiBar }: Props) {
  const { session, appsData, updateAppState, clearNotifications, soundsEnabled } = useContext(GlobalContext);
  const colors = (theme as any)[phone].diary.colors;
  const diary = useMemo(() => getDiary(), []);
  const strings = (key: string) => getAppString('herphone', 'diary', key);
  const savedSolved: number[] = appsData[phone].apps?.diary?.solved ?? [];

  const slides = Math.ceil(diary.pages.length / PAGES_PER_SLIDE);
  const [pageSet, setPageSet] = useState(() =>
    Math.min(Math.max((session?.episode ?? 1) - 1, 0), slides - 1),
  );
  const [selected, setSelected] = useState(-1);
  const [solvedPage, setSolvedPage] = useState(-1);
  const [pagesX, setPagesX] = useState(0);
  const [slideY, setSlideY] = useState(0);
  const cardX = useRef<number[]>([]);
  const cardY = useRef<number[]>([]);
  const [open] = useState(() => new Animated.Value(0));
  const [widths] = useState(() => Array.from({ length: PAGES_PER_SLIDE }, () => new Animated.Value(PAGE_W)));
  const [heights] = useState(() => Array.from({ length: PAGES_PER_SLIDE }, () => new Animated.Value(PAGE_H)));
  const [moveX] = useState(() => Array.from({ length: PAGES_PER_SLIDE }, () => new Animated.Value(0)));
  const [moveY] = useState(() => Array.from({ length: PAGES_PER_SLIDE }, () => new Animated.Value(0)));
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  // Opening the app dismisses its pop-up notifications.
  useFocusEffect(
    useCallback(() => {
      clearNotifications(phone, n => n.id.startsWith('diary'));
    }, [phone, clearNotifications]),
  );

  const pages: DiaryEntry[] = useMemo(
    () =>
      diary.pages.map((page, index) => {
        const state = !session ? 0 : savedSolved.includes(index + 1) ? 2 : pageState(session, page.start);
        return {
          ...page,
          state,
          content: page.content.map(line => ({ content: line.text, startTime: getSeconds(line.startTime) - 0.45 })),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [diary, session, savedSolved.join(',')],
  );

  const openPage = (index: number) => {
    if (soundsEnabled) playSound('paper.mp3');
    setSelected(pageSet * PAGES_PER_SLIDE + index);
    playAnimation(open, 1, OPEN_DURATION, undefined, false);
    playAnimation(widths[index], W, OPEN_DURATION, undefined, false);
    playAnimation(heights[index], H, OPEN_DURATION, undefined, false);
    playAnimation(moveX[index], -(pagesX + (cardX.current[index] ?? 0)), OPEN_DURATION, undefined, false);
    playAnimation(moveY[index], -(slideY + (cardY.current[index] ?? 0)), OPEN_DURATION, undefined, false);
  };

  const close = () => {
    const index = selected % PAGES_PER_SLIDE;
    playAnimation(open, 0, OPEN_DURATION, undefined, false);
    playAnimation(widths[index], PAGE_W, OPEN_DURATION, undefined, false);
    playAnimation(heights[index], PAGE_H, OPEN_DURATION, undefined, false);
    playAnimation(moveX[index], 0, OPEN_DURATION, undefined, false);
    playAnimation(moveY[index], 0, OPEN_DURATION, undefined, false);
    closeTimer.current = setTimeout(() => setSelected(-1), OPEN_DURATION);
  };

  const markSolved = (number: number) =>
    updateAppState(phone, 'diary', (prev: any) => ({
      ...prev,
      solved: [...new Set([...(prev?.solved ?? []), number])],
    }));

  const renderButton = (direction: 'left' | 'right') => {
    const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
    return (
      <CustomButton
        style={styles.button}
        onPress={() =>
          setPageSet(set => (direction === 'left' ? Math.max(set - 1, 0) : Math.min(set + 1, slides - 1)))
        }>
        <Icon color="black" size={scale(32)} />
      </CustomButton>
    );
  };

  const isOpen = selected % PAGES_PER_SLIDE !== -1;
  const slice = pages.slice(pageSet * PAGES_PER_SLIDE, pageSet * PAGES_PER_SLIDE + PAGES_PER_SLIDE);
  const current = isOpen ? pages[selected] : null;

  const imageFor = (page: DiaryEntry, number: number) => {
    if (page.state === 0) return assets.diary.pagelocked;
    if (page.state === 2 || solvedPage === number - 1) return assets.diary.page;
    return assets.diary.pagegrey;
  };

  const caption = (page: DiaryEntry) => {
    if (page.state === 0) return strings('not_recovered');
    const parsed = moment(page.date, DATE_FORMAT);
    return (parsed.isValid() ? parsed.format(DATE_FORMAT) : page.date) + (page.state === 1 ? '\n' + strings('locked') : '');
  };

  return (
    <View style={[styles.parentLayout, { backgroundColor: colors.background }]}>
      <Header phone={phone} />
      <View style={styles.content}>
        <CustomText
          center
          variant="h4"
          text={diary.intro}
          noDefaultMargin
          style={{ fontFamily: 'Caveat-Regular', letterSpacing: scale(0.4), paddingVertical: '2%', opacity: 0.8 }}
        />
        <View
          style={styles.slide}
          onLayout={(e: LayoutChangeEvent) => setSlideY(H * 0.09 + e.nativeEvent.layout.y)}>
          {renderButton('left')}
          <View style={styles.pages} onLayout={(e: LayoutChangeEvent) => setPagesX(e.nativeEvent.layout.x)}>
            {slice.map((page, index) => {
              const number = pageSet * PAGES_PER_SLIDE + index + 1;
              const dimmed = page.state === 0;
              const active = selected % PAGES_PER_SLIDE === index;
              return (
                <CustomButton
                  key={number}
                  onLayout={(e: LayoutChangeEvent) => {
                    cardX.current[index] = e.nativeEvent.layout.x;
                    cardY.current[index] = e.nativeEvent.layout.y;
                  }}
                  onPress={() => openPage(index)}
                  disabled={dimmed || isOpen}
                  silent
                  activeOpacity={1}
                  style={[styles.page, { zIndex: active ? 10 : 1 }]}>
                  <Animated.View
                    style={{
                      ...StyleSheet.absoluteFill,
                      width: widths[index],
                      height: heights[index],
                      justifyContent: 'center',
                      alignItems: 'center',
                      transform: [{ translateX: moveX[index] }, { translateY: moveY[index] }],
                    }}>
                    <CustomImage
                      style={{ width: '98%', height: '98%', opacity: dimmed ? 0.3 : 1 }}
                      resizeMode="stretch"
                      source={imageFor(page, number)}
                    />
                  </Animated.View>
                  <Animated.View
                    style={{
                      width: '100%',
                      zIndex: 11,
                      opacity: active ? open.interpolate({ inputRange: [0, 0.2], outputRange: [1, 0] }) : 1,
                    }}>
                    <CustomText
                      center
                      variant="h3"
                      text={`${strings('page')} ${number}`}
                      style={{ width: '100%', fontFamily: 'Caveat-Regular', opacity: dimmed ? 0.3 : 0.9, letterSpacing: 0 }}
                    />
                    <CustomText
                      center
                      variant="h5"
                      text={caption(page)}
                      style={{ width: '100%', fontFamily: 'Caveat-Regular', opacity: dimmed ? 0.3 : 0.9, letterSpacing: 0 }}
                    />
                  </Animated.View>
                </CustomButton>
              );
            })}
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                height: H,
                width: W,
                left: -pagesX,
                backgroundColor: colors.notificationBar,
                opacity: open,
                zIndex: selected === -1 ? 0 : 5,
              }}
            />
          </View>
          {renderButton('right')}
        </View>
      </View>
      {current ? (
        <Page
          number={selected + 1}
          data={current}
          close={close}
          setDisableNotiBar={setDisableNotiBar}
          setSolvedPage={setSolvedPage}
          onComplete={() => markSolved(selected + 1)}
          advancesStory={
            !!session &&
            session.episode === current.start[0] &&
            session.objective === current.start[1] &&
            session.checkpoint === current.start[2]
          }
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, flexDirection: 'column' },
  content: { width: '100%', height: '91%', justifyContent: 'flex-start', alignItems: 'center' },
  slide: {
    width: '100%',
    height: PAGES_H,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: { width: W * 0.11, height: PAGES_H, justifyContent: 'center', alignItems: 'center', zIndex: 0 },
  pages: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: PAGES_W,
    height: PAGES_H,
    flexWrap: 'wrap',
  },
  page: { width: PAGE_W, height: PAGE_H, justifyContent: 'center', alignItems: 'center', marginVertical: scale(4) },
});
