import React, { useMemo } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import moment from 'moment';
import { ArrowDownLeft, ArrowUpRight, Phone, X } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { scale } from '../../theme/scale';
import { getAppString } from '../../content/appStrings';
import { callerIds, HistoryEntry, HistoryHighlight } from '../../content/mock/callHistory';
import { DATE_FORMAT } from '../../utils/date';
import { findCallContact, getCallName } from '../../phone/call/CallProvider';

const { width: W, height: H } = Dimensions.get('screen');

export type HistoryItem = Partial<HistoryEntry> & Pick<HistoryEntry, 'time' | 'type'> & { transformedId: string };

const str = (key: string) => getAppString('myphone', 'phone', key);

/** Whole days between the call and the in-game "now", as "Today" / "3d ago". */
function calculateDays(time: string, now: moment.Moment) {
  const strict = moment.utc(time, DATE_FORMAT, true);
  const then = strict.isValid() ? strict : moment.utc(time);
  const days = Math.floor(moment.duration(now.diff(then)).asDays());
  return days < 1 ? str('today') : str('days_ago').replace('33', String(days));
}

type RowProps = {
  item: HistoryItem;
  now: moment.Moment;
  highlight: HistoryHighlight | null;
  pulse: Animated.Value;
  onCall: (item: HistoryItem) => void;
  onHighlightPress: () => void;
};

/** One call: direction icon with its age, who it was (and how they were identified), call button. */
function HistoryRow({ item, now, highlight, pulse, onCall, onHighlightPress }: RowProps) {
  const contact = item.contact ?? findCallContact(item.number ?? '');
  const name = getCallName(contact, item.name || item.number || '');
  const callerId = item.caller_id ?? callerIds[contact ?? ''] ?? callerIds[item.number ?? ''];
  const rowHighlighted = !!highlight?.time && highlight.number === item.number && highlight.time === item.time;
  const callHighlighted = !!highlight && !highlight.time && highlight.number === item.number;
  const Icon = item.type === 'missed' ? X : item.type === 'incoming' ? ArrowDownLeft : ArrowUpRight;
  const iconColor = item.type === 'missed' ? theme.colors.red : item.type === 'incoming' ? theme.colors.blue : theme.colors.green;

  return (
    <Animated.View style={[styles.itemWrapper, { opacity: rowHighlighted ? pulse : 1 }]}>
      <CustomButton silent activeOpacity={1} onPress={rowHighlighted ? onHighlightPress : undefined} style={styles.item}>
        <View style={styles.left}>
          <View style={styles.icon}>
            <Icon style={{ marginRight: '6%' }} size={scale(24)} color={iconColor} />
            <CustomText
              noDefaultMargin
              style={{ marginTop: '10%' }}
              variant="small"
              color="#FFFFFF99"
              text={calculateDays(item.time, now)}
            />
          </View>
        </View>
        <View style={styles.middle}>
          <CustomText
            noDefaultMargin
            style={{ marginVertical: '1%' }}
            color="#FFFFFFEE"
            bold={!item.caller_id}
            text={`${name} ${item.count ? `(${item.count})` : ''}`}
          />
          <CustomText
            noDefaultMargin
            variant="caption"
            color="#FFFFFF99"
            text={callerId ? `${str('caller_identified')}: ${callerId}` : contact ? str('saved_contact') : ''}
          />
        </View>
        <CustomButton disabled={!!highlight?.time} activeOpacity={0.6} style={styles.right} onPress={() => onCall(item)}>
          <Animated.View style={{ opacity: callHighlighted ? pulse : 1 }}>
            <Phone size={scale(24)} color="#FFFFFFCC" />
          </Animated.View>
        </CustomButton>
      </CustomButton>
    </Animated.View>
  );
}

type Props = Omit<RowProps, 'item'> & { history: HistoryItem[] };

/** Scrolling call log. */
export default function History({ history, now, highlight, pulse, onCall, onHighlightPress }: Props) {
  const extraData = useMemo(() => ({ now, highlight, pulse }), [now, highlight, pulse]);
  return (
    <FlashList
      contentContainerStyle={styles.list}
      data={history}
      extraData={extraData}
      keyExtractor={item => item.transformedId}
      renderItem={({ item }) => (
        <HistoryRow
          item={item}
          now={now}
          highlight={highlight}
          pulse={pulse}
          onCall={onCall}
          onHighlightPress={onHighlightPress}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  // The reference pads the list by 7% / 6% / 18% of the screen width; plain numbers keep FlashList's item layout exact.
  list: { width: '100%', paddingHorizontal: W * 0.07, paddingLeft: W * 0.06, paddingBottom: W * 0.18 },
  itemWrapper: { width: '100%', height: (H * 10) / 100, marginTop: '1%' },
  item: { width: '100%', height: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
  left: { width: '15%', height: '100%', justifyContent: 'center', alignItems: 'flex-start' },
  icon: { height: '100%', justifyContent: 'center', alignItems: 'center' },
  middle: { width: '70%', height: '100%', paddingHorizontal: '4%', justifyContent: 'center' },
  right: { flexGrow: 1, height: '100%', justifyContent: 'center', alignItems: 'flex-end' },
});
