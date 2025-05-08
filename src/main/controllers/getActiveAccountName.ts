import { getCurrentActiveAccountName } from '../node/helpers';

const getActiveAccountName = async (): Promise<string> => {
  return getCurrentActiveAccountName();
};

export default getActiveAccountName;
