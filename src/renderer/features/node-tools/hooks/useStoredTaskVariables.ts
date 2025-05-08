import { useMutation, useQuery } from 'react-query';

import {
  QueryKeys,
  getStoredTaskVariables,
  storeTaskVariable,
} from 'renderer/services';

export const useStoredTaskVariables = () => {
  const storedTaskVariablesQuery = useQuery(
    [QueryKeys.StoredTaskVariables],
    getStoredTaskVariables
  );

  const storeTaskVariableMutation = useMutation(storeTaskVariable);

  return { storedTaskVariablesQuery, storeTaskVariableMutation };
};
