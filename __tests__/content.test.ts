import content, { getCallScript, getMainStoryEvent, isAppVisible, phones, progressPercentage } from '../src/content';
import { translateNotificationText } from '../src/content/notifications';


describe('story progression', () => {
  it('walks checkpoints, then objectives, then episodes', () => {
    const start = content.initialSession;
    const next = content.promote(start, 'checkpoint');
    expect(next).toEqual({ episode: 0, objective: 1, checkpoint: 0 });
    const ep1 = content.promote(next!, 'objective');
    expect(ep1).toEqual({ episode: 1, objective: 0, checkpoint: 0 });
  });

  it('exposes the checkpoint gather list on the story event', () => {
    const event: any = getMainStoryEvent({ episode: 1, objective: 1, checkpoint: 0 }, true);
    expect(event.gather.infos).toHaveLength(2);
    expect(event.title).toBe("Look through Zoey's phone");
  });

  it('reports progress as a percentage of all checkpoints', () => {
    expect(progressPercentage(content.initialSession)).toBe(0);
    expect(progressPercentage({ episode: 1, objective: 1, checkpoint: 1 })).toBeGreaterThan(50);
  });
});

describe('content lookups', () => {
  it('prefers the most specific call script', () => {
    const specific = getCallScript('myphone', 'colleague', { episode: 1, objective: 1, checkpoint: 1 });
    const generic = getCallScript('myphone', 'colleague', { episode: 0, objective: 0, checkpoint: 0 });
    expect(specific?.options).toHaveLength(2);
    expect(generic?.lines[0].text).toContain('busy');
  });

  it('keeps story-only apps off the home screen', () => {
    expect(isAppVisible(phones.herphone.apps.recovery, null)).toBe(false);
    expect(isAppVisible(phones.herphone.apps.messages, null)).toBe(true);
  });

  it('expands notification tokens', () => {
    expect(translateNotificationText('missed_calls_12')).toBe('12 missed calls');
    expect(translateNotificationText('[image]')).toBe('(Image)');
    expect(translateNotificationText('box_arrived')).toBe('A box has arrived on your desk');
  });
});
