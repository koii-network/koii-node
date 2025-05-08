import config from 'config';
import sendMessage from 'preload/sendMessage';

export default (averageSlotTime: number): Promise<number> =>
  sendMessage(config.endpoints.GET_TIME_TO_NEXT_REWARD, { averageSlotTime });
