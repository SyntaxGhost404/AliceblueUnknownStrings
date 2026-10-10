import React, { useContext, useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import { playAnimation } from '../../theme/animation';
import { playSound } from '../../audio/sound';
import { ChatMessage, GlobalContext } from '../../state/GlobalProvider';
import MessageSystem from './MessageSystem';
import MessageText from './MessageText';
import MessageImage, { ImageViewData } from './MessageImage';
import MessageAudio from './MessageAudio';

type Props = {
  chatName: string;
  message: ChatMessage;
  extraMargin: boolean;
  group?: boolean;
  setImageView: (data: ImageViewData) => void;
};

/**
 * One row of the conversation. Messages that hold a clue for the current objective blink;
 * tapping one notes the clue down.
 */
export default function Message({ chatName, message, extraMargin, group, setImageView }: Props) {
  const navigation = useNavigation<any>();
  const { gatherInfos, handleGatherInfo, soundsEnabled } = useContext(GlobalContext);
  const [fade] = useState(() => new Animated.Value(0));
  const gatherId = `messages:${chatName}:${message.id}`;
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    playAnimation(fade, 1, 200);
  }, [fade]);

  useEffect(() => {
    setBlinking(!!gatherInfos?.find(info => info.id === gatherId));
  }, [gatherInfos, gatherId]);

  const onPress = () => {
    const { text } = message;
    if (blinking) {
      if (soundsEnabled) playSound('button.mp3');
      setBlinking(false);
      handleGatherInfo(gatherId);
      return;
    }
    if (text.startsWith('url::')) navigation.popTo('browser', { url: text.split('::')[1] });
  };

  const { text, type } = message;

  return (
    <Animated.View onStartShouldSetResponder={() => true} style={{ width: '100%', marginBottom: extraMargin ? '4%' : '2%', opacity: fade }}>
      <CustomButton style={{ width: '100%' }} onPress={onPress} silent activeOpacity={blinking ? 0.6 : 0.8}>
        {text.startsWith('system') ? (
          <MessageSystem text={text} blinking={blinking} />
        ) : (
          <View style={[styles.container, { justifyContent: type === 0 ? 'flex-start' : 'flex-end' }]}>
            {text.startsWith('image::') ? (
              <MessageImage
                text={text}
                blinking={blinking}
                sender={message.sender}
                type={type}
                group={group}
                setImageView={setImageView}
              />
            ) : text.startsWith('audio::') ? (
              <MessageAudio text={text} blinking={blinking} sender={message.sender} type={type} time={message.time} group={group} />
            ) : (
              <MessageText text={text} blinking={blinking} sender={message.sender} type={type} time={message.time} group={group} />
            )}
          </View>
        )}
      </CustomButton>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', flexDirection: 'row', alignItems: 'center' },
});
