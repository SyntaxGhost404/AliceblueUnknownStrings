import React, { useContext, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Eye } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { getAppImage } from '../../assets/images';
import { GlobalContext } from '../../state/GlobalProvider';
import { isActiveInSession } from '../../content';
import { getAppString } from '../../content/appStrings';
import { HIDDEN_UNLOCKED_FROM, hiddenPhotos } from '../../content/mock/gallery';
import { PhoneName } from '../../content/types';
import Header from './Header';
import PatternLock from './PatternLock';
import { photoBlur, photoOpacity, viewParams } from './photoView';

type Props = { phone: PhoneName; navigation: any; setNotiBarColor: (c: string) => void };

/** Hidden album: locked behind a pattern until the story passes the mock window. */
export default function Hidden({ phone, navigation, setNotiBarColor }: Props) {
  const { session } = useContext(GlobalContext);
  const colors = (theme as any)[phone].gallery.colors;
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    if (isActiveInSession(session, HIDDEN_UNLOCKED_FROM)) setIsLocked(false);
  }, [session]);

  return (
    <View style={[styles.parentLayout, { backgroundColor: colors.background }]}>
      <Header phone={phone} showBack setNotiBarColor={setNotiBarColor} />
      {isLocked ? (
        <PatternLock setIsLocked={setIsLocked} />
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignSelf: 'center', alignItems: 'center' }}>
            <Eye color={theme.colors.white} size={scale(24)} />
            <CustomText
              variant="h5"
              style={{ marginHorizontal: '2%', marginBottom: '2.5%' }}
              center
              white
              text={getAppString('herphone', 'gallery', 'hidden')}
            />
          </View>
          <ScrollView
            style={{ width: '100%' }}
            contentContainerStyle={{ paddingHorizontal: theme.padding as any, paddingTop: '1%', paddingBottom: '18%' }}>
            {hiddenPhotos.map(photo => (
              <CustomButton
                key={photo.id}
                style={styles.image}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('imageview', viewParams(photo))}>
                <Image
                  source={getAppImage('gallery', photo.image) as any}
                  resizeMode="cover"
                  blurRadius={photoBlur(photo.blur)}
                  style={{ width: '100%', height: '100%', borderRadius: scale(1), opacity: photoOpacity(photo.darken) }}
                />
              </CustomButton>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, flexDirection: 'column' },
  image: { width: '100%', aspectRatio: 1.2, padding: '0.2%' },
});
