import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomModal from '../../components/CustomModal';
import { scale } from '../../theme/scale';
import { PixabowlPost } from '../../content/mock/pixabowl';
import { PhoneName } from '../../content/types';
import Post from './Post';

type Props = {
  phone: PhoneName;
  /** The post to show; null keeps the modal closed. */
  data: PixabowlPost | null;
  setPost: (post: PixabowlPost | null) => void;
};

/** A post lifted over its profile grid (the shared in-phone modal, tinted for Pixabowl). */
export default function PostModal({ phone, data, setPost }: Props) {
  return (
    <CustomModal visible={data !== null} setVisible={() => setPost(null)} backdropColor="#000301dd">
      <View style={styles.container}>
        {data ? <Post phone={phone} data={data} onClickPerson={() => setPost(null)} /> : null}
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
    padding: '1%',
    backgroundColor: '#230828',
    borderRadius: scale(12),
  },
});
