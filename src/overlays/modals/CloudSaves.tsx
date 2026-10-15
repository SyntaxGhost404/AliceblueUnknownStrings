import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Check, CheckCircle2, CloudCheck, Copy, RefreshCw } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomModal from '../../components/CustomModal';
import CustomText from '../../components/CustomText';
import assets from '../../assets';
import theme from '../../theme/theme';
import { createAnimation } from '../../theme/animation';
import { scale } from '../../theme/scale';
import { GlobalContext } from '../../state/GlobalProvider';
import { CloudSave, mockCloud, UserProfile } from '../../state/cloud';
import { deleteItem, retrieveItem, storeItem } from '../../state/storage';
import { progressPercentage } from '../../content';
import { getGeneral } from '../../content/general';
import { Session } from '../../content/types';
import { copy } from '../../content/mock/modals';
import { copyText } from './clipboard';
import { useDismiss, useRestartGame, useTimers } from './hooks';

type Provider = UserProfile['provider'];
type Phase = 'idle' | 'loading' | 'conflict' | 'confirmDelete' | 'deleting';
type Pending = { profile: UserProfile; cloud: CloudSave };

const sameSession = (a: Session, b: Session) =>
  a.episode === b.episode && a.objective === b.objective && a.checkpoint === b.checkpoint;

const GREEN = '#4CAF5099';
const BLUE = '#3F7FAF';

/** One side of the "local vs cloud" comparison. */
function ProgressCard(props: {
  title: string;
  color: string;
  session: Session;
  percentage: number;
  selected: boolean;
  onPress: () => void;
}) {
  const { session, selected } = props;
  const label = session.episode === 0 ? copy.prologue : `${getGeneral('progress', 'episode')} ${session.episode}`;
  return (
    <View
      onTouchEnd={props.onPress}
      style={{
        width: '48%',
        borderRadius: scale(16),
        borderWidth: scale(2),
        borderColor: theme.colors.darkGray,
        justifyContent: 'center',
        alignItems: 'center',
        padding: '4%',
        opacity: selected ? 1 : 0.5,
      }}
    >
      <CustomText bold color={props.color} center text={props.title} />
      <CustomText
        style={{ marginBottom: 0 }}
        color={theme.colors.darkGray}
        center
        variant="caption"
        text={getGeneral('progress', 'main_story')}
      />
      <CustomText
        style={{ marginTop: 0 }}
        color={theme.colors.white}
        center
        variant="caption"
        text={`${label} - ${props.percentage}%`}
      />
      <View style={[styles.check, { backgroundColor: selected ? theme.colors.darkGray : 'transparent' }]}>
        <Check color="#070A0C" size={scale(14)} />
      </View>
    </View>
  );
}

/**
 * Account and cloud-save dialog. Cloud storage is simulated on-device (`mockCloud`): signing in
 * mirrors every save to a separate copy. When that copy is at a different point than the game
 * being played, the player picks which progress to keep before the account is linked.
 */
export default function CloudSaves({ onClose }: { onClose: () => void }) {
  const { user, setUser, session, saveData, loadCloudSave } = useContext(GlobalContext);
  const restart = useRestartGame();
  const later = useTimers();
  const [introDone, setIntroDone] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [pending, setPending] = useState<Pending | null>(null);
  const [choice, setChoice] = useState<0 | 1 | 2>(0);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [copied, setCopied] = useState(false);
  const [spin] = useState(() => new Animated.Value(0));
  const resetTimers = useRef<{ synced?: ReturnType<typeof setTimeout>; copied?: ReturnType<typeof setTimeout> }>({});
  const blocked = phase !== 'idle' && phase !== 'confirmDelete' ? true : !user && !introDone;
  const { modalKey, dismiss } = useDismiss(blocked, onClose);

  useEffect(() => {
    retrieveItem('started').then(started => setIntroDone(started === 'true'));
    const timers = resetTimers.current;
    return () => {
      clearTimeout(timers.synced);
      clearTimeout(timers.copied);
    };
  }, []);

  useEffect(() => {
    if (!syncing) return;
    spin.setValue(0);
    const loop = Animated.loop(createAnimation(spin, 1, 1000, Easing.linear));
    loop.start();
    return () => loop.stop();
  }, [syncing, spin]);

  const markStarted = () => storeItem('started', 'true');

  const signIn = async (provider: Provider) => {
    setPhase('loading');
    const profile = await mockCloud.signIn(provider);
    const cloud = await mockCloud.load();
    if (cloud && session && !sameSession(cloud.session, session)) {
      setPending({ profile, cloud });
      setChoice(0);
      setPhase('conflict');
    } else {
      // From here on every save is mirrored to the cloud copy.
      setUser(profile);
      setPhase('idle');
    }
  };

  const onSync = async () => {
    if (!pending || choice === 0) return;
    setPhase('loading');
    setUser(pending.profile);
    if (choice === 2) {
      await loadCloudSave(pending.cloud);
      restart();
    } else {
      setPending(null);
      setPhase('idle');
    }
  };

  const onCancelSync = async () => {
    await mockCloud.signOut();
    setPending(null);
    setPhase('idle');
  };

  const onUnlink = async () => {
    await mockCloud.signOut();
    setUser(null);
    onClose();
  };

  const onDelete = async () => {
    setPhase('deleting');
    await mockCloud.signOut();
    await deleteItem('cloud');
    setUser(null);
    later(onClose, 800);
  };

  const onSyncWithCloud = () => {
    clearTimeout(resetTimers.current.synced);
    setSynced(false);
    setSyncing(true);
    saveData();
    later(() => {
      setSyncing(false);
      setSynced(true);
      resetTimers.current.synced = setTimeout(() => setSynced(false), 3000);
    }, 1500);
  };

  const onCopy = () => {
    if (!user) return;
    copyText(user.id);
    clearTimeout(resetTimers.current.copied);
    setCopied(true);
    resetTimers.current.copied = setTimeout(() => setCopied(false), 3000);
  };

  const label = (text: string, extra?: object) => (
    <CustomText
      variant="subtext"
      noDefaultMargin
      color={theme.colors.mediumGray}
      style={{ marginBottom: '1%', marginLeft: '2%', ...extra }}
      text={text}
    />
  );

  const signInButton = (provider: Provider, text: string) => (
    <CustomButton style={styles.button} onPress={() => signIn(provider)}>
      <CustomImage width="12%" aspectRatio={1} source={assets.socials[provider]} />
      {label(text)}
    </CustomButton>
  );

  let body: React.ReactNode;
  if (phase === 'loading') {
    body = <CustomText color={theme.colors.black3} text={getGeneral('login', 'loading')} />;
  } else if (phase === 'deleting') {
    body = (
      <CustomText gray center variant="subtext" noDefaultMargin style={{ width: '80%' }} text={copy.cloud.deleting} />
    );
  } else if (phase === 'confirmDelete') {
    body = (
      <>
        <CustomText
          gray
          center
          variant="subtext"
          noDefaultMargin
          style={{ width: '80%' }}
          text={copy.cloud.deleteConfirm}
        />
        <CustomText error center variant="caption" style={{ width: '80%' }} text={copy.cloud.deleteWarning} />
        <View style={{ flexDirection: 'row', width: '92%', justifyContent: 'space-between', marginBottom: '4%' }}>
          <CustomButton style={styles.confirmButton} onPress={() => setPhase('idle')}>
            <CustomText
              variant="text"
              noDefaultMargin
              color={theme.colors.mediumGray}
              style={{ marginBottom: '1%', marginLeft: '2%' }}
              text={copy.cloud.no}
            />
          </CustomButton>
          <CustomButton style={styles.confirmButton} onPress={onDelete}>
            <CustomText
              variant="text"
              noDefaultMargin
              error
              style={{ marginBottom: '1%', marginLeft: '2%' }}
              text={copy.cloud.yes}
            />
          </CustomButton>
        </View>
      </>
    );
  } else if (phase === 'conflict' && pending && session) {
    body = (
      <>
        <CustomText gray center variant="subtext" style={{ width: '80%' }} text={copy.cloud.conflict} />
        <View style={{ flexDirection: 'row', width: '92%', justifyContent: 'space-between', marginVertical: '4%' }}>
          <ProgressCard
            title={copy.cloud.local}
            color={theme.colors.green}
            session={session}
            percentage={progressPercentage(session)}
            selected={choice === 1}
            onPress={() => setChoice(c => (c === 1 ? 0 : 1))}
          />
          <ProgressCard
            title={copy.cloud.cloud}
            color={theme.colors.blue}
            session={pending.cloud.session}
            percentage={pending.cloud.percentage}
            selected={choice === 2}
            onPress={() => setChoice(c => (c === 2 ? 0 : 2))}
          />
        </View>
        <View style={{ flexDirection: 'row', width: '92%', justifyContent: 'space-between', marginBottom: '4%' }}>
          <CustomButton style={styles.progressButton} onPress={onCancelSync}>
            <CustomText gray text={getGeneral('progress', 'cancel')} />
          </CustomButton>
          <CustomButton
            disabled={choice === 0}
            style={[
              styles.progressButton,
              { backgroundColor: theme.colors.lightGray, opacity: choice === 0 ? 0.4 : 1 },
            ]}
            onPress={onSync}
          >
            <CustomText text={copy.cloud.sync} />
          </CustomButton>
        </View>
      </>
    );
  } else if (!user && !introDone) {
    body = (
      <>
        <CustomText gray center variant="caption" style={{ width: '80%' }} text={copy.cloud.intro} />
        <CustomButton
          style={[styles.button, { marginVertical: '6%' }]}
          onPress={() => {
            markStarted();
            setIntroDone(true);
          }}
        >
          {label(copy.cloud.introButton)}
        </CustomButton>
        <CustomButton
          style={styles.button}
          onPress={() => {
            markStarted();
            onClose();
          }}
        >
          {label(copy.cloud.noThanks)}
        </CustomButton>
      </>
    );
  } else if (!user) {
    body = (
      <>
        <CustomText
          gray
          center
          variant="subtext"
          noDefaultMargin
          style={{ width: '80%', marginVertical: '2%' }}
          text={copy.cloud.options}
        />
        {signInButton('google', getGeneral('settings', 'sign_in_google'))}
        {signInButton('apple', getGeneral('settings', 'sign_in_apple'))}
      </>
    );
  } else {
    body = (
      <>
        <View style={styles.info}>
          <View style={styles.infoBar}>
            <CustomText
              bold
              variant="caption"
              noDefaultMargin
              color={theme.colors.darkGray}
              style={{ marginRight: '0.5%' }}
              text={copy.cloud.linkedWith + (user.provider === 'apple' ? copy.cloud.apple : copy.cloud.google)}
            />
            <CustomImage
              style={{ paddingTop: '1%' }}
              width="7%"
              aspectRatio={1}
              source={assets.socials[user.provider]}
            />
          </View>
          <View style={[styles.infoBar, { borderTopWidth: 0, paddingTop: 0 }]}>
            <CustomText
              variant="caption"
              noDefaultMargin
              color={GREEN}
              style={{ marginRight: '1.25%' }}
              text={copy.cloud.saved}
            />
            <CloudCheck style={{ marginTop: '1%' }} size={scale(16)} color={GREEN} />
          </View>
          <CustomButton style={styles.infoBar} onPress={onCopy}>
            <CustomText
              numberOfLines={1}
              noDefaultMargin
              style={{ width: '82%', marginRight: '1.25%' }}
              variant="caption"
              color={theme.colors.darkGray}
              text={`${getGeneral('settings', 'user_id')}: ${user.id}`}
            />
            {copied ? (
              <CheckCircle2 size={scale(14)} color={theme.colors.darkGray} />
            ) : (
              <Copy size={scale(14)} color={theme.colors.darkGray} />
            )}
          </CustomButton>
          <CustomButton disabled={syncing} style={styles.infoBar} onPress={onSyncWithCloud}>
            <CustomText
              numberOfLines={1}
              noDefaultMargin
              variant="caption"
              color={BLUE}
              style={{ marginRight: '1.25%' }}
              text={copy.cloud.syncWithCloud}
            />
            <Animated.View
              style={{
                transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
              }}
            >
              {synced ? <CheckCircle2 size={scale(15)} color={BLUE} /> : <RefreshCw size={scale(15)} color={BLUE} />}
            </Animated.View>
          </CustomButton>
        </View>
        <CustomButton style={styles.button} onPress={onUnlink}>
          {label(copy.cloud.unlink)}
        </CustomButton>
        <CustomButton style={styles.button} onPress={() => setPhase('confirmDelete')}>
          <CustomText
            error
            variant="subtext"
            noDefaultMargin
            style={{ marginBottom: '1%', marginLeft: '2%' }}
            text={copy.cloud.deleteAccount}
          />
        </CustomButton>
      </>
    );
  }

  return (
    <CustomModal key={modalKey} visible setVisible={dismiss}>
      <View style={styles.container}>
        <CustomText
          gray
          center
          style={{ width: '80%', fontFamily: 'JosefinSans-Bold' }}
          text={user ? copy.cloud.linkedAccount : copy.cloud.linkAccount}
        />
        {body}
      </View>
    </CustomModal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '88%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '3%',
    paddingVertical: '5%',
    backgroundColor: '#070A0C',
    borderRadius: scale(16),
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    width: '64%',
    borderWidth: scale(1),
    borderColor: '#FFFFFF17',
    borderRadius: scale(40),
    marginVertical: '2%',
    paddingVertical: '3%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    width: '90%',
    backgroundColor: '#FFFFFF09',
    alignItems: 'center',
    marginVertical: '4%',
    borderRadius: scale(10),
  },
  infoBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: scale(1),
    borderTopColor: '#040404',
    paddingHorizontal: '3%',
    paddingVertical: '3%',
  },
  check: {
    position: 'absolute',
    top: '3.5%',
    right: '3.5%',
    width: '17%',
    aspectRatio: 1,
    borderWidth: scale(1),
    borderColor: theme.colors.darkGray,
    borderRadius: scale(100),
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressButton: {
    width: '48%',
    borderWidth: scale(1),
    borderColor: theme.colors.black3,
    borderRadius: scale(40),
    marginVertical: '2%',
    paddingHorizontal: '2%',
    paddingVertical: '4%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    width: '48%',
    borderWidth: scale(1),
    borderColor: theme.colors.black3,
    borderRadius: scale(40),
    marginVertical: '2%',
    paddingHorizontal: '2%',
    paddingVertical: '4%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
