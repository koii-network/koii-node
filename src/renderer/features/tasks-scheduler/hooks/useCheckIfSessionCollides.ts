import { useEffect, useState } from 'react';

import { ScheduleMetadata } from 'models';
import { validateSchedulerSession } from 'renderer/services/api';

export const useCheckIfSessionCollides = (session: ScheduleMetadata) => {
  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    validateSchedulerSession(session).then(setIsValid);
  }, [session]);

  return isValid;
};
