import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AudioLines, FileX2, Video, Volume2 } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import assets from '../../assets';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { getAppImage } from '../../assets/images';
import { GlobalContext } from '../../state/GlobalProvider';
import { isActiveInSession } from '../../content';
import files, { FileItem } from '../../content/mock/files';
import { PhoneName } from '../../content/types';
import ErrorBox from './ErrorBox';
import Header from './Header';

type Props = { phone: PhoneName; navigation: any; route: any; setNotiBarColor: (c: string) => void };

/** Files list: a grid of thumbnails; corrupted files open an error notice that leads to recovery. */
export default function Home({ phone, navigation, route, setNotiBarColor }: Props) {
  const { session, recoveredApps, appsData, updateAppState } = useContext(GlobalContext);
  const colors = (theme as any)[phone].files.colors;
  const saved: string[] = appsData[phone].apps?.files?.recovered ?? [];
  const unseen: string[] = recoveredApps?.files ?? [];
  const isRecovered = (id: string) => saved.includes(id) || unseen.includes(id);
  const isCorrupted = (file: FileItem) => !!file.corrupted && !isRecovered(file.id);

  const visible = useMemo(() => files.filter(file => isActiveInSession(session, file.start, file.end)), [session]);
  const [errorFile, setErrorFile] = useState<FileItem | null>(() =>
    route.params?.error ? visible.find(file => file.corrupted && !isRecovered(file.id)) ?? null : null,
  );

  useFocusEffect(
    useCallback(() => {
      setNotiBarColor(colors.notificationBar);
    }, [colors.notificationBar, setNotiBarColor]),
  );

  // Recovered files stay restored after their "new" badge has been seen.
  useEffect(() => {
    const missing = unseen.filter(id => !saved.includes(id));
    if (missing.length === 0) return;
    updateAppState(phone, 'files', (prev: any) => ({
      ...prev,
      recovered: [...new Set([...(prev?.recovered ?? []), ...missing])],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unseen.join(',')]);

  const onPressItem = (file: FileItem) => {
    if (isCorrupted(file)) setErrorFile(file);
    else navigation.navigate('file', { data: file });
  };

  const startRecovery = () => {
    const file = errorFile;
    setErrorFile(null);
    if (!file) return;
    navigation.navigate('recovery', {
      recovery: file.recovery ?? { puzzle: 0, recoveries: [{ count: 1, type: 'file' }] },
      recovered: { files: [file.id] },
      returnTo: 'files',
    });
  };

  return (
    <View style={[styles.parentLayout, { backgroundColor: colors.background }]}>
      <Header phone={phone} />
      <ScrollView style={{ width: '100%' }} contentContainerStyle={styles.scroll}>
        <View style={styles.files}>
          {visible.map(file => {
            const corrupted = isCorrupted(file);
            const isNew =
              !isRecovered(file.id) && !!session && file.start[0] === session.episode && file.start[1] === session.objective;
            return (
              <CustomButton key={file.id} activeOpacity={0.4} style={styles.file} onPress={() => onPressItem(file)}>
                {file.type === 'video' ? (
                  <CustomImage width="100%" height="100%" source={getAppImage('files', file.id)} />
                ) : file.type === 'audio' ? (
                  <View style={styles.audioArt}>
                    <AudioLines size={scale(48)} color="#FFFFFF33" />
                  </View>
                ) : null}
                <View style={styles.details}>
                  <CustomText numberOfLines={2} bold white variant="caption" text={file.name} />
                  <View style={styles.meta}>
                    <CustomText bold color={theme.colors.darkGray} variant="caption" text={file.date} />
                    <View style={styles.icon}>
                      {corrupted ? (
                        <FileX2 color={theme.colors.red} size={scale(15)} />
                      ) : file.type === 'video' ? (
                        <Video color={theme.colors.darkGray} size={scale(15)} />
                      ) : (
                        <Volume2 color={theme.colors.darkGray} size={scale(15)} />
                      )}
                    </View>
                  </View>
                </View>
                {unseen.includes(file.id) ? (
                  <View style={styles.recovered}>
                    <CustomImage width="73%" aspectRatio={1} source={assets.notifications['recovery-black']} />
                  </View>
                ) : null}
                {isNew ? <View style={styles.badge} /> : null}
              </CustomButton>
            );
          })}
        </View>
      </ScrollView>
      {errorFile ? <ErrorBox onClose={startRecovery} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, flexDirection: 'column' },
  scroll: { width: '100%', paddingHorizontal: theme.padding as any, paddingVertical: '10%', alignItems: 'center' },
  files: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' },
  file: {
    width: '46%',
    aspectRatio: 1,
    borderRadius: scale(2),
    backgroundColor: '#000000',
    overflow: 'hidden',
    marginBottom: '8%',
  },
  audioArt: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: '30%',
  },
  details: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    justifyContent: 'space-between',
    paddingHorizontal: '4%',
    paddingVertical: '1%',
    backgroundColor: '#000000CC',
  },
  meta: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  icon: { padding: '4%', alignItems: 'center', justifyContent: 'center' },
  recovered: {
    position: 'absolute',
    top: '4%',
    right: '4%',
    width: '12%',
    aspectRatio: 1,
    borderRadius: scale(100),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: '4%',
    right: '4%',
    width: '6%',
    aspectRatio: 1,
    borderRadius: scale(100),
    backgroundColor: theme.colors.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
