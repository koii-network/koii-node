import { TaskMetadata } from 'models';

export const isOrcaTask = (metadata?: TaskMetadata | null) => {
  if (!metadata?.requirementsTags) {
    return false;
  }

  return metadata?.requirementsTags.find((e) => {
    return e.type === 'ADDON' && e.value === 'ORCA_TASK';
  });
};
