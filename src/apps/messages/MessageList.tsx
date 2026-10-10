import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { scale } from '../../theme/scale';
import { ChatMessage } from '../../state/GlobalProvider';
import Message from './Message';
import Typing from './Typing';
import { ImageViewData } from './MessageImage';

const { width: W } = Dimensions.get('screen');

type Item = ChatMessage | { transformedId: 'typing' };

type Props = {
  chatName: string;
  messages: Item[];
  typer?: string | null;
  group?: boolean;
  setImageView: (data: ImageViewData) => void;
};

/** Conversation, newest at the bottom (inverted list), with the typing bubble as row 0. */
export default function MessageList({ chatName, messages, typer, group, setImageView }: Props) {
  return (
    <View style={{ width: '100%', height: '64.5%' }}>
      <FlashList
        inverted
        contentContainerStyle={styles.chat}
        data={messages}
        keyExtractor={item => item.transformedId}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        maintainVisibleContentPosition={{ disabled: true }}
        renderItem={({ item, index }) => {
          if (item.transformedId === 'typing') return <Typing sender={typer} group={group} />;
          const message = item as ChatMessage;
          if (!message.text || message.deleted) return null;
          const newer = messages[index - 1] as ChatMessage | undefined;
          return (
            <Message
              chatName={chatName}
              message={message}
              group={group}
              extraMargin={!!newer && (newer as any).type !== message.type}
              setImageView={setImageView}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  chat: { paddingHorizontal: W * 0.06, paddingVertical: scale(12) },
});
