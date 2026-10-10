import React from 'react';
import { AppProps } from './types';
import { makePlaceholderApp } from './Placeholder';
import Messages from './messages/Messages';

const appIds = [
  'messages',
  'call',
  'calculator',
  'browser',
  'notes',
  'archive',
  'sidetrails',
  'settings',
  'mail',
  'gallery',
  'pixabowl',
  'diary',
  'files',
  'symmetry',
  'recovery',
  'safemode',
];

/** Phone apps by id. Each receives AppProps from the phone navigator. */
const apps: Record<string, React.ComponentType<AppProps>> = {
  ...Object.fromEntries(appIds.map(id => [id, makePlaceholderApp(id)])),
  messages: Messages,
};

export default apps;
