import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';

import { ScheduleMetadata } from 'models';
import {
  addTasksSchedulerSession,
  getTasksSchedulerSessionById,
  QueryKeys,
} from 'renderer/services';

import { defaultSessionId } from '../constants';

const defaultSessionData: ScheduleMetadata = {
  startTime: '00:00:00',
  stopTime: null,
  days: [0, 1, 2, 3, 4, 5, 6],
  isEnabled: false,
  id: defaultSessionId,
};

export const useDefaultSchedulerSession = (): ScheduleMetadata | undefined => {
  const queryCache = useQueryClient();

  const [defaultSession, setDefaultSession] = useState<ScheduleMetadata>();

  useEffect(() => {
    const checkAndCreateDefaultSession = async () => {
      try {
        const session = await getTasksSchedulerSessionById(defaultSessionId);

        setDefaultSession(session);

        if (!session) {
          await addTasksSchedulerSession(defaultSessionData);
        }
      } catch (error) {
        console.error('Failed to check/create default session: ', error);
      } finally {
        queryCache.invalidateQueries([QueryKeys.SchedulerSessions]);
      }
    };

    checkAndCreateDefaultSession();
  }, [queryCache]);

  return defaultSession;
};
