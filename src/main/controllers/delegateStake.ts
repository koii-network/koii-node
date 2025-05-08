import { Event } from 'electron';

import { DelegateStakeParam, DelegateStakeResponse } from 'models';

import { delegateStakeKOII } from './delegateStakeKOII';
import { delegateStakeKPL } from './delegateStakeKPL';

const delegateStake = async (
  _: Event,
  payload: DelegateStakeParam
): Promise<DelegateStakeResponse> => {
  const handler =
    payload.taskType === 'KPL' ? delegateStakeKPL : delegateStakeKOII;

  return handler(_, payload);
};

export default delegateStake;
