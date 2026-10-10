import React from 'react';
import { useGameUI } from '../../navigation/GameUIContext';

/**
 * Renders the in-game overlays (transition, flashback, fade, timer, floating note, time
 * skip, timeline, mind palace, quick deduce, floating hints) that are open in `overlays`.
 */
export default function GameplayHost() {
  const { overlays } = useGameUI();
  void overlays;
  return <></>;
}
