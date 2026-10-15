import React, { useContext, useEffect } from 'react';
import { OverlayKey, useGameUI } from '../../navigation/GameUIContext';
import { GlobalContext } from '../../state/GlobalProvider';
import CloudSaves from './CloudSaves';
import Credits from './Credits';
import Language from './Language';
import NeedHelp from './NeedHelp';
import NewEpisodeModal from './NewEpisodeModal';
import PrologueEnd from './PrologueEnd';
import ResetProgress from './ResetProgress';
import StartNextEpisode from './StartNextEpisode';

/**
 * Renders the menu-style modals (cloud saves, reset progress, language, help, credits,
 * episode prompts, prologue ending) that are open in `overlays`. Each one closes itself
 * through `hideOverlay`; stacking order follows the reference build.
 */
export default function ModalsHost() {
  const { overlays, showOverlay, hideOverlay } = useGameUI();
  const { overlayRequest, setOverlayRequest } = useContext(GlobalContext);
  const close = (key: OverlayKey) => () => hideOverlay(key);

  // The game navigator opens every requested overlay each time it mounts. This effect runs in
  // the same commit as its own, so the request is still delivered once and is then dropped;
  // otherwise a game remount (reset progress, end of the prologue) would reopen the overlay.
  useEffect(() => {
    if (overlayRequest) setOverlayRequest(null);
  }, [overlayRequest, setOverlayRequest]);

  return (
    <>
      {overlays.startNextEpisode ? <StartNextEpisode onClose={close('startNextEpisode')} /> : null}
      {overlays.language ? <Language onClose={close('language')} /> : null}
      {overlays.prologueEnd ? <PrologueEnd onClose={close('prologueEnd')} /> : null}
      {overlays.credits ? (
        <Credits
          episodeEnd={overlays.credits === 'episodeend'}
          onClose={close('credits')}
          onEpisodeEnd={() => showOverlay('newEpisodeModal')}
        />
      ) : null}
      {overlays.newEpisodeModal ? <NewEpisodeModal onClose={close('newEpisodeModal')} /> : null}
      {overlays.cloudSaves ? <CloudSaves onClose={close('cloudSaves')} /> : null}
      {overlays.resetProgress ? <ResetProgress onClose={close('resetProgress')} /> : null}
      {overlays.needHelp ? <NeedHelp onClose={close('needHelp')} /> : null}
    </>
  );
}
