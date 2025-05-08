import { taskScheduler } from '../../tasks-scheduler';

export const removeSession = async (_: Event, payload: { id: string }) => {
  const { id } = payload;

  taskScheduler.removeSchedule(id);
};
