import { useCallback, useEffect, useRef, useState } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';

/**
 * Backdrop-dismiss guard for `CustomModal`: while `blocked`, a backdrop tap must not close the
 * dialog. CustomModal fades itself out before asking to close, so a refused close remounts it
 * (bumping `modalKey`) to bring it back instead of leaving an invisible overlay behind.
 */
export function useDismiss(blocked: boolean, onClose: () => void) {
  const [modalKey, setModalKey] = useState(0);
  const dismiss = useCallback(() => {
    if (blocked) setModalKey(k => k + 1);
    else onClose();
  }, [blocked, onClose]);
  return { modalKey, dismiss };
}

/** The reference build restarted the whole app after a reset or restore; this drops back to the splash. */
export function useRestartGame() {
  const navigation = useNavigation();
  return useCallback(() => {
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'splash' }] }));
  }, [navigation]);
}

/** Collects timeouts so a dialog can schedule follow-ups and drop them all when it unmounts. */
export function useTimers() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);
  return useCallback((fn: () => void, delay: number) => {
    timers.current.push(setTimeout(fn, delay));
  }, []);
}
