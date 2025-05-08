/* eslint-disable @cspell/spellchecker */
import { ScheduleMetadata, ScheduleMetadataUpdateType } from 'models';

export const addTasksSchedulerSession = async (
  schedule: Omit<ScheduleMetadata, 'id'>
) => {
  return window.main.addSession(schedule);
};

export const updateSessionById = async (
  schedule: ScheduleMetadataUpdateType
) => {
  console.log('updating session', schedule);
  return window.main.updateSessionById(schedule);
};

export const removeTasksSchedulerSession = async (scheduleId: string) => {
  return window.main.removeSession({ id: scheduleId });
};

export const getTasksSchedulerSessions = async () => {
  return window.main.getAllSessions();
};

export const getTasksSchedulerSessionById = async (sessionId: string) => {
  return window.main.getSessionById({ id: sessionId });
};

export const getSchedulerTasks = async () => {
  return window.main.getSchedulerTasks();
};

export const addTaskToScheduler = async (taskPublicKey: string) => {
  return window.main.addTaskToScheduler({ taskPublicKey });
};

export const removeTaskFromScheduler = async (taskPublicKey: string) => {
  return window.main.removeTaskFromScheduler({ taskPublicKey });
};

export const validateSchedulerSession = (
  payload: ScheduleMetadata
): Promise<boolean> => {
  return window.main.validateSchedulerSession(payload);
};
