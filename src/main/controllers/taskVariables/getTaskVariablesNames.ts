import { Event } from 'electron';

import { RequirementType, GetTaskVariablesNamesParam } from 'models';

import { getTaskInfo } from '../getTaskInfo';
import { getTaskMetadata } from '../getTaskMetadata';

export const getTaskVariablesNames = async (
  _: Event,
  { taskPublicKey }: GetTaskVariablesNamesParam
): Promise<string[]> => {
  const { metadataCID } = await getTaskInfo(
    _,
    { taskAccountPubKey: taskPublicKey },
    'getTaskVariablesNames'
  );

  const taskMetadata = await getTaskMetadata(_, { metadataCID });

  console.log(
    'TASK METADATA OF ',
    taskPublicKey,
    ' with metadataCID ',
    metadataCID,
    taskMetadata
  );

  const variableTypes = [
    RequirementType.GLOBAL_VARIABLE,
    RequirementType.TASK_VARIABLE,
  ];

  return taskMetadata.requirementsTags
    ?.filter(({ type }) => variableTypes.includes(type))
    .map(({ value }) => value!);
};
