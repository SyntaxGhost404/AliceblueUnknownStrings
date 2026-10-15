import React, { useEffect, useState } from 'react';
import { Animated, Easing, I18nManager, StyleSheet, View } from 'react-native';
import { ArrowDownCircle, Check } from 'lucide-react-native';
import CustomButton from '../../components/CustomButton';
import CustomModal from '../../components/CustomModal';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { createAnimation } from '../../theme/animation';
import { scale } from '../../theme/scale';
import { retrieveItem, storeItem } from '../../state/storage';
import { getGeneral } from '../../content/general';
import { copy, defaultLanguage, LanguageOption, languages } from '../../content/mock/modals';
import { useDismiss } from './hooks';

/**
 * Language picker: the current language is checked, tapping another one marks it for download
 * and "Confirm" fetches it behind a progress bar. Only English ships in this build, so the
 * other entries are listed but disabled.
 */
export default function Language({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState(defaultLanguage);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress] = useState(() => new Animated.Value(0));
  const { modalKey, dismiss } = useDismiss(loading, onClose);

  useEffect(() => {
    retrieveItem('language').then(code => code && setCurrent(code));
  }, []);

  const onConfirm = () => {
    if (!selected) return;
    setLoading(true);
    createAnimation(progress, 1, 1500, Easing.linear, false).start(async () => {
      await storeItem('language', selected);
      setCurrent(selected);
      setLoading(false);
      onClose();
    });
  };

  const renderIcon = (item: LanguageOption, side: 'left' | 'right') => {
    if (current === item.code) {
      return <Check strokeWidth={scale(2.5)} color={theme.colors.white} size={scale(16)} />;
    }
    if (selected === item.code) {
      return (
        <ArrowDownCircle
          strokeWidth={scale(1)}
          style={{ position: 'absolute', [side]: '10%' }}
          color={theme.colors.darkGray}
          size={scale(16)}
        />
      );
    }
    return null;
  };

  return (
    <CustomModal key={modalKey} visible setVisible={dismiss}>
      <View style={styles.container}>
        <View style={styles.buttons}>
          {languages.map(item => {
            const isCurrent = current === item.code;
            return (
              <CustomButton
                key={item.code}
                disabled={loading || isCurrent || !item.available}
                style={[
                  styles.button,
                  { borderColor: selected === item.code ? theme.colors.black3 : 'transparent', opacity: item.available ? 1 : 0.4 },
                ]}
                onPress={() => setSelected(item.code)}>
                {I18nManager.isRTL ? renderIcon(item, 'left') : null}
                <CustomText
                  noDefaultMargin
                  bold={isCurrent}
                  color={isCurrent ? theme.colors.white : theme.colors.darkGray}
                  style={{ marginHorizontal: '4%' }}>
                  {item.displayName}
                </CustomText>
                {!I18nManager.isRTL ? renderIcon(item, 'right') : null}
              </CustomButton>
            );
          })}
        </View>
        {loading ? (
          <View style={[styles.progress, { alignItems: I18nManager.isRTL ? 'flex-end' : 'flex-start' }]}>
            <Animated.View
              style={[styles.bar, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]}
            />
          </View>
        ) : null}
        {languages.some(l => !l.available) ? <CustomText gray variant="caption" center text={copy.moreLanguages} /> : null}
        <View style={{ flexDirection: 'row', width: '92%', justifyContent: 'center', marginTop: '8%' }}>
          <CustomButton
            disabled={loading || !selected}
            style={[styles.menuButton, { backgroundColor: theme.colors.lightGray, opacity: selected ? 1 : 0.5 }]}
            onPress={onConfirm}>
            <CustomText text={loading ? getGeneral('settings', 'downloading') : copy.confirm} />
          </CustomButton>
        </View>
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
    padding: '5%',
    paddingVertical: '5%',
    backgroundColor: '#070A0C',
    borderRadius: scale(16),
    overflow: 'hidden',
  },
  buttons: { width: '100%', alignItems: 'center', paddingHorizontal: '4%', marginBottom: '4%' },
  button: {
    marginVertical: '0.5%',
    width: '60%',
    paddingVertical: '3%',
    paddingHorizontal: '6%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(100),
    borderWidth: scale(1),
  },
  menuButton: {
    width: '82%',
    borderWidth: scale(1),
    borderColor: theme.colors.black3,
    borderRadius: scale(40),
    paddingHorizontal: '2%',
    paddingVertical: '3%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progress: {
    width: '80%',
    height: scale(6),
    backgroundColor: theme.colors.black2,
    borderRadius: scale(100),
    marginTop: '6%',
    overflow: 'hidden',
  },
  bar: { width: '100%', height: '100%', backgroundColor: theme.colors.white },
});
