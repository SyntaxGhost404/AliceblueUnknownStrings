import React, { createContext, useMemo } from 'react';
import content, * as story from '../content';
import { Session } from '../content/types';

// Read-only access to story content for screens. The reference build loaded content
// bundles through this provider; here every lookup is backed by the mock data module.

function useContentState() {
  return useMemo(
    () => ({
      phones: story.phones,
      getMainStoryEvent: story.getMainStoryEvent,
      /** Side stories are not part of this build's mock content. */
      getSidetrailsEvent: (_session: unknown, _includeObjective?: boolean) => null,
      getEpisode: story.getEpisode,
      getConversation: story.getConversation,
      getFillerChat: story.getFillerChat,
      getChatNames: story.getChatNames,
      getProfileStatus: story.getProfileStatus,
      getProfileName: story.getProfileName,
      isAppVisible: story.isAppVisible,
      isMusicOn: story.isMusicOn,
      launchScreen: (session: Session) => content.launchScreen(session),
    }),
    [],
  );
}

export type ContentState = ReturnType<typeof useContentState>;

export const ContentContext = createContext<ContentState>(null as unknown as ContentState);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const value = useContentState();
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}
