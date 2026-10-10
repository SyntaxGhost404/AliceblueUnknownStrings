import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { ArrowLeft } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import assets from '../../assets';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { GlobalContext } from '../../state/GlobalProvider';
import { storeItem } from '../../state/storage';
import { isGameScreen, MainStackParamList } from '../../navigation/types';
import { CloudSave, mockCloud } from '../../state/cloud';

type Props = StackScreenProps<MainStackParamList, 'login'>;

/** 0 = choose, 1 = new game, 2 = load game. */
type Mode = 0 | 1 | 2;

/**
 * First-launch screen. Account linking is simulated locally (there is no backend in this
 * build): "signing in" creates a local profile and looks for a mirrored cloud save, which
 * drives the same "Saved progress detected!" / "No saved game found!" branches.
 */
export default function LoginScreen({ navigation }: Props) {
  const { user, setUser, launchScreen, resetProgress, loadCloudSave } = useContext(GlobalContext);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>(0);
  const [savedProgress, setSavedProgress] = useState<CloudSave | null>(null);
  const [checked, setChecked] = useState(false);

  const navigateTo = (episode: number, screen = launchScreen) => {
    if (episode !== 0) navigation.replace('title', { nextScreen: screen ?? 'myphone' });
    else if (isGameScreen(screen)) navigation.replace('game', { screen });
    else navigation.replace((screen ?? 'game') as any);
  };

  const checkAlreadyProgress = async () => {
    setLoading(true);
    const save = await mockCloud.load();
    setSavedProgress(save);
    setChecked(true);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) setLoading(false);
    else checkAlreadyProgress();
  }, [user]);

  const signIn = async (provider: 'google' | 'apple') => {
    setLoading(true);
    const profile = await mockCloud.signIn(provider);
    setUser(profile);
  };

  const newGame = async () => {
    await resetProgress();
    await storeItem('started', 'true');
    navigateTo(0);
  };

  const loadGame = async (save: CloudSave) => {
    setLoading(true);
    const restored = await loadCloudSave(save);
    await storeItem('started', 'true');
    navigateTo(save.session.episode, restored);
  };

  const backButton = (
    <CustomButton style={styles.back} onPress={() => setMode(0)}>
      <ArrowLeft size={scale(16)} color="white" />
    </CustomButton>
  );

  const option = (label: string, onPress: () => void, icon?: any) => (
    <CustomButton style={styles.socialsignin} onPress={onPress}>
      {icon ? <CustomImage width="12%" aspectRatio={1} source={icon} /> : null}
      <CustomText
        variant="subtext"
        style={icon ? { marginBottom: '1%', marginLeft: '2%' } : { marginLeft: '2%' }}
        noDefaultMargin
        color={theme.colors.mediumGray}
        text={label}
      />
    </CustomButton>
  );

  let body: React.ReactNode;
  if (loading) {
    body = <CustomText color={theme.colors.black3} text="Loading..." />;
  } else if (mode === 0) {
    body = (
      <>
        <CustomButton onPress={() => setMode(1)}>
          <CustomText color={theme.colors.mediumGray} text="New Game" />
        </CustomButton>
        <CustomButton style={{ marginTop: '10%' }} onPress={() => setMode(2)}>
          <CustomText color={theme.colors.mediumGray} text="Load Game" />
        </CustomButton>
      </>
    );
  } else if (savedProgress) {
    const episodeNumber = savedProgress.session.episode;
    const episodeLabel = episodeNumber === 0 ? 'Prologue' : 'Episode ' + episodeNumber;
    body = (
      <>
        <CustomText
          center
          gray
          variant="subtext"
          style={{ marginTop: '6%', width: '80%' }}
          text={`Saved progress detected!\n ${episodeLabel} - ${savedProgress.percentage}%`}
        />
        <CustomText
          center
          error
          variant="caption"
          style={{ marginBottom: '6%', width: '80%' }}
          text="Starting a new game will overwrite the saved progress"
        />
        {option('Continue', () => loadGame(savedProgress))}
        {option('Start a new game', newGame)}
      </>
    );
  } else if (checked) {
    body = (
      <>
        {backButton}
        <CustomText center gray variant="subtext" style={{ marginTop: '6%', width: '80%' }} text="No saved game found!" />
        {option('Start a new game', newGame)}
      </>
    );
  } else {
    body = (
      <>
        {backButton}
        <CustomText
          gray
          center
          variant="caption"
          style={{ marginVertical: '6%', width: '80%' }}
          text="You can choose to link your account to save your progress online."
        />
        {option('Sign-in with Google', () => signIn('google'), assets.socials.google)}
        {option('Sign-in with Apple', () => signIn('apple'), assets.socials.apple)}
        {mode === 1 ? (
          <>
            <CustomText gray center variant="caption" style={{ marginVertical: '2%' }} text="or" />
            {option('Play without signing in', newGame)}
          </>
        ) : null}
      </>
    );
  }

  return <View style={styles.parentLayout}>{body}</View>;
}

const styles = StyleSheet.create({
  parentLayout: {
    flex: 1,
    backgroundColor: '#070A0C',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10%',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: scale(1),
    borderColor: theme.colors.black3,
    borderRadius: scale(40),
    padding: '3%',
  },
  socialsignin: {
    flexDirection: 'row',
    width: '80%',
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
