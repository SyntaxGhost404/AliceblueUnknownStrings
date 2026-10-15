import React, { useContext, useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import moment from 'moment';
import { FlashList } from '@shopify/flash-list';
import CustomButton from '../../components/CustomButton';
import CustomImage from '../../components/CustomImage';
import CustomText from '../../components/CustomText';
import assets from '../../assets';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { getAppImage } from '../../assets/images';
import { GlobalContext } from '../../state/GlobalProvider';
import { isActiveInSession } from '../../content';
import { photosByDate } from '../../content/mock/gallery';
import { PhoneName } from '../../content/types';
import Header from './Header';
import { photoBlur, photoOpacity, viewParams } from './photoView';

const DATE_KEY = 'DD-MM-YYYY';

type Props = { phone: PhoneName; navigation: any; setNotiBarColor: (c: string) => void };

/** Photo grid grouped by day, newest first; tapping a photo opens the viewer. */
export default function Home({ phone, navigation, setNotiBarColor }: Props) {
  const { session, recoveredApps } = useContext(GlobalContext);
  const colors = (theme as any)[phone].gallery.colors;
  const recovered = recoveredApps?.gallery ?? [];
  const dates = useMemo(
    () => Object.keys(photosByDate).sort((a, b) => moment(b, DATE_KEY).diff(moment(a, DATE_KEY))),
    [],
  );

  const renderItem = ({ item: date }: { item: string }) => {
    const photos = photosByDate[date].filter(photo => isActiveInSession(session, photo.start, photo.end));
    if (photos.length === 0) return null;
    return (
      <CustomButton activeOpacity={1} silent style={styles.tabs}>
        <CustomText style={{ marginLeft: '1%' }} white variant="text" noDefaultMargin text={moment(date, DATE_KEY).format('MMM Do, YYYY')} />
        <View style={styles.images}>
          {photos.map(photo => {
            const isRecovered = recovered.includes(photo.id);
            const hotspot = photo.hotspot;
            return (
              <CustomButton
                key={photo.id}
                style={styles.image}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('imageview', viewParams(photo))}>
                <View style={{ width: '100%', height: '100%', opacity: isRecovered ? 0.75 : 1 }}>
                  <Image
                    source={getAppImage('gallery', photo.image) as any}
                    resizeMode="cover"
                    blurRadius={photoBlur(photo.blur)}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: scale(1),
                      opacity: photoOpacity(photo.darken),
                      transform: [{ rotateY: photo.mirror ? '180deg' : '0deg' }, { rotate: `${(photo.rotate ?? 0) * 90}deg` }],
                    }}
                  />
                  {hotspot ? (
                    <CustomImage
                      style={{ position: 'absolute', top: hotspot.top as any, left: hotspot.left as any }}
                      width={hotspot.width as any}
                      aspectRatio={hotspot.aspectRatio}
                      source={getAppImage('gallery', hotspot.image)}
                    />
                  ) : null}
                </View>
                {isRecovered ? (
                  <View style={styles.recovered}>
                    <CustomImage width="70%" aspectRatio={1} source={assets.notifications['recovery-black']} />
                  </View>
                ) : null}
              </CustomButton>
            );
          })}
        </View>
      </CustomButton>
    );
  };

  return (
    <View style={[styles.parentLayout, { backgroundColor: colors.background }]}>
      <Header phone={phone} showEye setNotiBarColor={setNotiBarColor} />
      <FlashList
        style={{ width: '100%' }}
        contentContainerStyle={styles.scroll}
        data={dates}
        renderItem={renderItem}
        keyExtractor={item => item}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, flexDirection: 'column' },
  scroll: { paddingHorizontal: theme.padding as any, paddingTop: '1%', paddingBottom: '18%' },
  tabs: { flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%', marginTop: '4%' },
  images: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', marginTop: '2%', width: '100%', flexWrap: 'wrap' },
  image: { width: '33.3%', aspectRatio: 1, padding: '0.2%', backgroundColor: 'black' },
  recovered: {
    position: 'absolute',
    top: '2%',
    right: '2%',
    width: '15%',
    aspectRatio: 1,
    marginTop: '1%',
    marginLeft: '2.5%',
    borderRadius: scale(100),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
