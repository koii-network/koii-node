import { atom } from 'jotai';

import { TaskMetadata } from 'models';
import { Task } from 'renderer/types';

export const selectedTasksAtom = atom([] as Task[]);
export const tasksMetadataByIdAtom = atom({} as Record<string, TaskMetadata>);
export const availableTaskUpgradesAtom = atom([] as string[]);
