import React, { useContext, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import CustomText from '../../components/CustomText';
import theme from '../../theme/theme';
import { GlobalContext } from '../../state/GlobalProvider';
import { episodeCount, getEpisode } from '../../content';
import { Session } from '../../content/types';
import Header from './Header';
import TaskItem from './TaskItem';

type Task = { id: string; title: string; current: boolean; last: boolean; infos: string[] };

/**
 * Objectives reached so far (newest first), skipping the prologue. Each lists the clues of the
 * checkpoints already completed. `last` marks the oldest task, which has no line below it.
 */
export function getCompletedTasks(session: Session): Task[] {
  const tasks: Task[] = [];
  for (let e = 1; e < episodeCount() && session.episode >= e; e++) {
    getEpisode(e).objectives.forEach((objective, o) => {
      if (session.episode === e && session.objective < o) return;
      const current = session.episode === e && session.objective === o;
      const infos: string[] = [];
      objective.checkpoints.forEach((checkpoint, c) => {
        const clues = checkpoint.gather?.infos;
        if (!clues) return;
        const passed =
          session.episode > e ||
          session.objective > o ||
          (session.episode === e && session.objective === o && session.checkpoint > c);
        if (passed) infos.push(...clues.map(clue => clue.text).filter(text => text !== ''));
      });
      tasks.unshift({ id: `${e}-${o}`, title: objective.title, current, last: e === 1 && o === 0, infos });
    });
  }
  return tasks;
}

/** Task list: a vertical timeline of the case objectives, the current one pulsing at the top. */
export default function Tasks() {
  const { session } = useContext(GlobalContext);
  const tasks = useMemo(() => (session && session.episode !== 0 ? getCompletedTasks(session) : []), [session]);

  return (
    <View style={[styles.parentLayout, { backgroundColor: theme.myphone.archive.colors.background }]}>
      <Header title="Tasks" showBack />
      {session && session.episode !== 0 ? (
        <FlashList
          contentContainerStyle={styles.tasks}
          data={tasks}
          renderItem={({ item }) => <TaskItem current={item.current} last={item.last} title={item.title} infos={item.infos} />}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          maintainVisibleContentPosition={{ disabled: true }}
        />
      ) : (
        <CustomText
          white
          center
          text="Your case related objectives will show up here."
          style={{ marginTop: '10%', alignSelf: 'center', paddingHorizontal: '10%' }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  parentLayout: { flex: 1, flexDirection: 'column' },
  tasks: { width: '100%', padding: theme.padding as any },
});
