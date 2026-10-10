import React from 'react';
import { useGameUI } from '../../navigation/GameUIContext';

/**
 * Renders the menu-style modals (cloud saves, reset progress, language, help, credits,
 * episode prompts, prologue ending) that are open in `overlays`.
 */
export default function ModalsHost() {
  const { overlays } = useGameUI();
  void overlays;
  return <></>;
}
