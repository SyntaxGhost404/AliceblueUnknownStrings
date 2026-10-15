import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Video from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { getAppImage } from '../../assets/images';
import { MUSIC_VOLUME, useMusic } from '../../audio/MusicProvider';
import { GlobalContext } from '../../state/GlobalProvider';
import { getAppString } from '../../content/appStrings';
import { FileItem, fileVideos } from '../../content/mock/files';
import { PhoneName } from '../../content/types';
import FileAudio from './FileAudio';
import Header from './Header';

/** A video that has not started loading after this long falls back to its poster. */
const LOAD_TIMEOUT = 3000;
/** Time spent on a file before it counts as a gathered clue. */
const GATHER_DELAY = 4000;

type Props = { phone: PhoneName; route: any; setNotiBarColor: (c: string) => void };

/** File viewer: a video (poster if it cannot load) or the voice-note player. */
export default function File({ phone, route, setNotiBarColor }: Props) {
  const file: FileItem = route.params.data;
  const music = useMusic();
  const { clearNotifications, gatherInfos, handleGatherInfo, recoveredApps, setRecoveredApps } = useContext(GlobalContext);
  const [ended, setEnded] = useState(false);
  const [failed, setFailed] = useState(false);
  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const colors = (theme as any)[phone].files.colors;

  useFocusEffect(
    useCallback(() => {
      setNotiBarColor('black');
    }, [setNotiBarColor]),
  );

  useEffect(
    () => () => {
      music?.setVolume(MUSIC_VOLUME);
      if (loadTimer.current) clearTimeout(loadTimer.current);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Looking at a restored file clears its "recovered" badge in the list.
  useEffect(() => {
    if (!recoveredApps?.files?.includes(file.id)) return;
    setRecoveredApps(prev => (prev ? { ...prev, files: (prev.files ?? []).filter(id => id !== file.id) } : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recoveredApps]);

  // Opening a file dismisses its notification.
  useEffect(() => {
    clearNotifications(phone, n => n.id === `files.${file.id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, file]);

  // A file that is part of the current clue hunt counts once it has been looked at for a while.
  useEffect(() => {
    if (!gatherInfos?.find(info => info.id === `files:${file.id}`)) return;
    const timer = setTimeout(() => handleGatherInfo(`files:${file.id}`), GATHER_DELAY);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gatherInfos]);

  const onLoadStart = () => {
    setEnded(false);
    if (!loadTimer.current) loadTimer.current = setTimeout(() => setFailed(true), LOAD_TIMEOUT);
  };

  const onLoad = () => {
    if (loadTimer.current) clearTimeout(loadTimer.current);
    loadTimer.current = null;
  };

  const onError = (error: unknown) => {
    setFailed(true);
    console.log('Files app: failure in loading video: ', error);
  };

  const poster = getAppImage('files', file.id);

  return (
    <View style={[styles.parentLayout, { backgroundColor: colors.background }]}>
      <Header
        phone={phone}
        title={file.type === 'video' ? getAppString('herphone', 'files', 'video') : undefined}
      />
      <View style={styles.content}>
        <View style={styles.file}>
          {file.type === 'video' ? (
            <View style={[styles.fileType, { aspectRatio: file.aspectRatio }]}>
              <CustomButton style={styles.clickable} disabled>
                {failed ? (
                  <CustomImage style={StyleSheet.absoluteFill} source={poster} />
                ) : (
                  <Video
                    paused={ended}
                    resizeMode="contain"
                    source={fileVideos[file.id]}
                    style={StyleSheet.absoluteFill}
                    onEnd={() => setEnded(true)}
                    onLoadStart={onLoadStart}
                    onLoad={onLoad}
                    onError={onError}
                  />
                )}
              </CustomButton>
              {ended ? (
                <CustomButton style={styles.button} onPress={() => setEnded(value => !value)}>
                  <Ionicons style={{ opacity: 0.8 }} name="play-circle" size={scale(64)} color="white" />
                </CustomButton>
              ) : null}
            </View>
          ) : file.type === 'audio' ? (
            <FileAudio data={file} />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1 },
  content: {
    width: '100%',
    height: '91%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  file: {
    width: '100%',
    borderRadius: scale(0),
    backgroundColor: '#000000',
    overflow: 'hidden',
    paddingBottom: '8%',
  },
  fileType: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  clickable: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  button: {
    position: 'absolute',
    padding: '4%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(100),
    borderWidth: scale(0),
    borderColor: theme.colors.darkerGray,
    backgroundColor: 'transparent',
  },
});
