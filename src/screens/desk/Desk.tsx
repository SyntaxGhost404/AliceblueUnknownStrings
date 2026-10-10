import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import assets from '../../assets';
import theme from '../../theme/theme';
import { createAnimation, playAnimation } from '../../theme/animation';
import { createSound, GameSound } from '../../audio/sound';
import { getSuspectBoardObject } from '../../assets/images';
import { GlobalContext } from '../../state/GlobalProvider';
import { isActiveInSession } from '../../content';
import { DeskObject, deskMess, deskObjects } from '../../content/mock/desk';
import Markings from './Markings';
import DontForget from './DontForget';

const { height: H } = Dimensions.get('screen');

type Item = DeskObject & {
  image?: ImageSourcePropType;
  /** Myphone only: the lit-screen frame it blinks to while a notification is waiting. */
  image2?: ImageSourcePropType;
  visible: boolean;
  clickable: boolean;
  anim: Animated.Value;
};

type BigView = { name: string };

let office: GameSound | null = null;
let steamTimer: ReturnType<typeof setTimeout> | null = null;
let steamState = 0;

/**
 * Adam's office: the corkboard wall with pinned photos, handwriting and red string, and the
 * desk below it with his phone, Zoey's phone, papers, an evidence box, a sticky note and a
 * cup of coffee. Tapping paperwork opens it full screen; tapping a phone jumps to it.
 */
export default function Desk() {
  const navigation = useNavigation<any>();
  const {
    session,
    notifications,
    setNotifications,
    highlightInSuspectBoard,
    setHighlightInSuspectBoard,
    gatherInfos,
    handleGatherInfo,
    triggerAction,
    soundsEnabled,
    appState,
  } = useContext(GlobalContext);

  const [objects, setObjects] = useState<Item[]>([]);
  const objectsRef = useRef(objects);
  objectsRef.current = objects;
  const [focused, setFocused] = useState(false);

  // Full-size viewer.
  const [bigView, setBigView] = useState<BigView | null>(null);
  const [bigViewImage, setBigViewImage] = useState<ImageSourcePropType | null>(null);
  const [bigViewReady, setBigViewReady] = useState(false);
  const [bigViewAnim] = useState(() => new Animated.Value(0));
  const [showCaseInfo, setShowCaseInfo] = useState(false);
  const [caseInfoAnim] = useState(() => new Animated.Value(1));

  // Evidence box: how many items have come out so far.
  const [boxIndex, setBoxIndex] = useState(0);
  const boxRef = useRef<{ item: string; last: boolean; box: Item } | null>(null);

  const [highlightAnim] = useState(() => new Animated.Value(0));
  const [phoneBlink] = useState(() => new Animated.Value(1));
  const phoneBlinkLoop = useRef<Animated.CompositeAnimation | null>(null);

  // Coffee.
  const [sips, setSips] = useState(3);
  const [cupAnim] = useState(() => new Animated.Value(0.5));
  const [steamAnim] = useState(() => new Animated.Value(0));
  const steamAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const sfx = (name: string) => {
    if (!soundsEnabled) return;
    const s = createSound(name, loaded => {
      if (loaded === 'error') return;
      s.play(() => s.release());
    });
  };

  // ---- Ambient office sound while the desk is on screen --------------------------------------
  const playDeskAudio = () => {
    if (!soundsEnabled) return;
    if (office) {
      office.play();
      return;
    }
    office = createSound('office.mp3', s => {
      if (s === 'error') return;
      s.setVolume(1);
      s.setNumberOfLoops(-1);
      s.play();
    });
  };
  const pauseDeskAudio = () => office?.pause();

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      // Arriving at the desk clears the "come and look at your desk" notifications.
      setNotifications(prev => ({
        ...prev,
        myphone: prev.myphone.filter(n => n.app !== 'suspectboard'),
      }));
      return () => setFocused(false);
    }, [setNotifications]),
  );

  useEffect(() => {
    if (focused && appState === 'foreground') playDeskAudio();
    else pauseDeskAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused, appState, soundsEnabled]);

  useEffect(
    () => () => {
      office?.stop();
      office?.release();
      office = null;
    },
    [],
  );

  // ---- Objects for the current point in the story --------------------------------------------
  useEffect(() => {
    setObjects(prev =>
      deskObjects.map(o => {
        const existing = prev.find(p => p.name === o.name);
        const item: Item = {
          ...o,
          image: getSuspectBoardObject(o.name),
          image2: o.name === 'myphone' ? getSuspectBoardObject(o.name, 'on') : undefined,
          visible: isActiveInSession(session, o.start, o.end),
          clickable: !deskMess.includes(o.name),
          anim: existing?.anim ?? new Animated.Value(1),
        };
        // Items still in the evidence box stay hidden until they are taken out.
        const box = deskObjects.find(b => b.items?.includes(o.name) && isActiveInSession(session, b.start, b.end));
        if (box && box.items!.indexOf(o.name) >= boxIndex) item.visible = false;
        return item;
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // ---- Coffee cup ------------------------------------------------------------------------------
  const cupBlink = () => {
    if (steamTimer) clearTimeout(steamTimer);
    steamState = 1 - steamState;
    steamAnimation.current = playAnimation(steamAnim, 1 - steamState, 1200);
    steamTimer = setTimeout(cupBlink, Math.random() * 400 + 1800);
  };

  useEffect(() => {
    setSips(3);
    cupBlink();
    return () => {
      if (steamTimer) clearTimeout(steamTimer);
      steamTimer = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sips === 0) {
      steamAnimation.current?.stop();
      if (steamTimer) clearTimeout(steamTimer);
    }
  }, [sips]);

  const onCupPress = () => {
    if (sips === 0) return;
    sfx('sip.mp3');
    setSips(s => s - 1);
    Animated.loop(
      Animated.sequence([
        createAnimation(cupAnim, 1, 200, Easing.linear),
        createAnimation(cupAnim, 0.5, 200, Easing.linear),
      ]),
      { iterations: 1 },
    ).start();
  };

  // ---- Adam's phone glows while it has something to show -----------------------------------
  useEffect(() => {
    if (notifications.myphone.length > 0) {
      phoneBlinkLoop.current = Animated.loop(
        Animated.sequence([
          createAnimation(phoneBlink, 0, 1200, Easing.linear),
          createAnimation(phoneBlink, 1, 1200, Easing.linear),
        ]),
      );
      phoneBlinkLoop.current.start();
    } else if (phoneBlinkLoop.current) {
      phoneBlinkLoop.current.reset();
    }
  }, [notifications.myphone.length, phoneBlink]);

  // ---- Highlighted object bobs gently ------------------------------------------------------
  useEffect(() => {
    if (!highlightInSuspectBoard) return;
    const loop = Animated.loop(
      Animated.sequence([createAnimation(highlightAnim, 3, 800), createAnimation(highlightAnim, 0, 800)]),
    );
    loop.start();
    return () => loop.stop();
  }, [highlightInSuspectBoard, highlightAnim]);

  // ---- Full-size viewer --------------------------------------------------------------------
  useEffect(() => {
    if (!bigView) return;
    playAnimation(bigViewAnim, 1, 150);
    const ready = setTimeout(() => setBigViewReady(true), 150);
    return () => clearTimeout(ready);
  }, [bigView, bigViewAnim]);

  // The case report has a hidden detail to note down while that clue is being gathered.
  useEffect(() => {
    if (!bigView) return;
    if (gatherInfos?.find(i => i.id === 'desk:casereport') && bigView.name === 'casereport') setShowCaseInfo(true);
  }, [bigView, gatherInfos]);

  useEffect(() => {
    if (!showCaseInfo) return;
    const loop = Animated.loop(
      Animated.sequence([createAnimation(caseInfoAnim, 0.2, 600), createAnimation(caseInfoAnim, 1, 600)]),
    );
    loop.start();
    return () => loop.stop();
  }, [showCaseInfo, caseInfoAnim]);

  const startBigView = (item: BigView, image?: ImageSourcePropType | null) => {
    setBigView(item);
    setBigViewImage(image ?? null);
  };

  const gather = (id: string) => {
    if (gatherInfos?.some(i => i.id === id)) handleGatherInfo(id);
  };

  const handleBigView = () => {
    if (!bigViewReady) return;
    setBigViewReady(false);
    setShowCaseInfo(false);
    playAnimation(bigViewAnim, 0, 150);
    setTimeout(() => {
      setBigView(null);
      setBigViewImage(null);
    }, 150);

    const fromBox = boxRef.current;
    if (!fromBox) return;
    boxRef.current = null;
    // The item lands on the desk/board once the viewer is out of the way.
    setTimeout(() => {
      setObjects(prev => prev.map(o => (o.name === fromBox.item ? { ...o, visible: true } : o)));
    }, 300);
    if (fromBox.last) {
      setTimeout(() => {
        setObjects(prev => prev.map(o => (o.name === fromBox.box.name ? { ...o, visible: false } : o)));
        if (highlightInSuspectBoard === fromBox.box.name) setHighlightInSuspectBoard(null);
        triggerAction(fromBox.box.onEmpty);
      }, 350);
    }
  };

  // ---- Object handlers ---------------------------------------------------------------------
  const handleImage = (item: Item) => {
    sfx('paper.mp3');
    gather('desk:' + item.name);
    startBigView({ name: item.name }, getSuspectBoardObject(item.name, 'big'));
  };

  const handleEvidenceBox = (box: Item) => {
    const items = box.items ?? [];
    if (boxIndex >= items.length) return;
    sfx('paper.mp3');
    const next = items[boxIndex];
    boxRef.current = { item: next, last: boxIndex + 1 >= items.length, box };
    gather('desk:' + next);
    startBigView({ name: next }, getSuspectBoardObject(next, 'big'));
    setBoxIndex(i => i + 1);
  };

  const handlePhone = (item: Item) => {
    sfx('button.mp3');
    navigation.navigate(item.name);
  };

  const onObjectPress = (item: Item) => {
    if (item.items) handleEvidenceBox(item);
    else if (item.name === 'myphone' || item.name === 'herphone') handlePhone(item);
    else handleImage(item);
  };

  // ---- Render --------------------------------------------------------------------------------
  const renderObject = (item: Item) => (
    <React.Fragment key={item.name}>
      {item.visible ? (
        <CustomButton
          activeOpacity={item.clickable ? 0.8 : 1}
          disabled={!item.clickable}
          onPress={() => onObjectPress(item)}
          silent
          style={{
            position: 'absolute',
            left: item.x as any,
            top: item.y as any,
            width: item.width as any,
            aspectRatio: item.aspectRatio,
          }}>
          <Animated.View
            style={{
              flex: 1,
              opacity: item.anim,
              transform: [
                {
                  translateY:
                    highlightInSuspectBoard === item.name
                      ? highlightAnim.interpolate({ inputRange: [-6, 0, 6], outputRange: [-2, 0, 2] })
                      : 0,
                },
              ],
            }}>
            <Animated.Image
              style={[styles.image, { opacity: item.name === 'myphone' ? phoneBlink : 1 }]}
              source={item.image as any}
            />
            {item.image2 ? (
              <Animated.Image
                style={[styles.image, { opacity: phoneBlink.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}
                source={item.image2 as any}
              />
            ) : null}
          </Animated.View>
        </CustomButton>
      ) : null}
      {item.name === 'photoframe' ? (
        <CustomButton
          activeOpacity={0.8}
          style={styles.dontforget}
          sound="paper.mp3"
          onPress={() => startBigView({ name: 'dontforget' })}>
          <DontForget />
        </CustomButton>
      ) : null}
    </React.Fragment>
  );

  return (
    <CustomButton silent activeOpacity={1} style={styles.parentLayout}>
      <View style={styles.wall}>
        <Image style={styles.image} fadeDuration={0} source={assets.suspectboard.wall} />
        <Markings />
      </View>
      <View style={styles.table}>
        <Image style={styles.image} fadeDuration={0} source={assets.suspectboard.table} />
      </View>
      {objects.map(renderObject)}

      <CustomButton activeOpacity={0.9} style={styles.cup} onPress={onCupPress} silent>
        <Animated.View
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: sips > 0 ? 1 : 0,
            transform: [{ rotateX: cupAnim.interpolate({ inputRange: [0, 1], outputRange: ['-15deg', '15deg'] }) }],
          }}>
          <CustomImage width="100%" height="100%" source={assets.suspectboard.cup} />
        </Animated.View>
        <CustomImage
          style={{ position: 'absolute', opacity: sips > 0 ? 0 : 1 }}
          width="100%"
          height="100%"
          source={assets.suspectboard.cup2}
        />
      </CustomButton>
      {sips > 0 ? (
        <View style={styles.cup} pointerEvents="none">
          <Animated.Image style={[styles.image, { position: 'absolute', opacity: steamAnim }]} source={assets.suspectboard.steam1} />
          <Animated.Image
            style={[
              styles.image,
              { position: 'absolute', opacity: steamAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
            ]}
            source={assets.suspectboard.steam2}
          />
        </View>
      ) : null}

      <Animated.View
        onTouchEnd={handleBigView}
        pointerEvents={bigView ? 'auto' : 'none'}
        style={[styles.backdrop, { opacity: bigViewAnim, zIndex: bigView ? 10 : -1 }]}
      />
      {bigView ? (
        <Animated.View
          pointerEvents="box-none"
          style={[styles.bigViewContainer, { zIndex: 10, opacity: bigViewAnim }]}>
          {bigView.name === 'dontforget' ? (
            <View style={{ width: '100%', height: '100%' }} onTouchEnd={handleBigView}>
              <DontForget big />
            </View>
          ) : (
            <Animated.Image onTouchEnd={handleBigView} style={styles.bigViewImage} source={bigViewImage as any} />
          )}
          {bigView.name === 'casereport' && showCaseInfo ? (
            <CustomButton
              disabled={!bigViewReady}
              activeOpacity={1}
              onPress={() => {
                gather('desk:casereport');
                setShowCaseInfo(false);
              }}
              style={styles.caseInfo}>
              <Animated.Image
                style={{ width: '100%', height: '100%', opacity: caseInfoAnim }}
                source={assets.suspectboard.casereportinfo}
              />
            </CustomButton>
          ) : null}
        </Animated.View>
      ) : null}
    </CustomButton>
  );
}

const styles = StyleSheet.create({
  parentLayout: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.suspectboard.colors.home.background,
  },
  wall: { width: '100%', height: '100%' },
  table: { position: 'absolute', bottom: 0, width: '100%', height: H * 0.2 },
  cup: { position: 'absolute', left: '36%', top: '89.5%', width: '15%', aspectRatio: 1 },
  image: { width: '100%', height: '100%', resizeMode: 'stretch', position: 'absolute' },
  bigViewImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  backdrop: { position: 'absolute', width: '100%', height: '100%', backgroundColor: '#000000CC' },
  bigViewContainer: {
    position: 'absolute',
    width: '85%',
    aspectRatio: 0.7,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dontforget: {
    position: 'absolute',
    left: '2%',
    top: '76.5%',
    width: '14%',
    aspectRatio: 0.67,
    transform: [{ rotateZ: '9deg' }],
  },
  caseInfo: { position: 'absolute', top: '56%', width: '100%', aspectRatio: 6.3 },
});
