import React from 'react';
import { AppProps } from './types';
import Messages from './messages/Messages';
import Call from './call';
import Calculator from './calculator';
import Browser from './browser';
import Notes from './notes';
import Archive from './archive';
import Sidetrails from './sidetrails';
import Settings from './settings';
import Mail from './mail';
import Gallery from './gallery';
import Pixabowl from './pixabowl';
import Diary from './diary';
import Files from './files';
import Symmetry from './symmetry';
import Recovery from './recovery';
import Safemode from './safemode';

/** Phone apps by id. Each receives AppProps from the phone navigator. */
const apps: Record<string, React.ComponentType<AppProps>> = {
  messages: Messages,
  call: Call,
  calculator: Calculator,
  browser: Browser,
  notes: Notes,
  archive: Archive,
  sidetrails: Sidetrails,
  settings: Settings,
  mail: Mail,
  gallery: Gallery,
  pixabowl: Pixabowl,
  diary: Diary,
  files: Files,
  symmetry: Symmetry,
  recovery: Recovery,
  safemode: Safemode,
};

export default apps;
