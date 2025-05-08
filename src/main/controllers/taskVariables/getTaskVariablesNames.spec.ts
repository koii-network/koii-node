import {
  GetTaskInfoParam,
  GetTaskInfoResponse,
  GetTaskMetadataParam,
  RequirementType,
  TaskMetadata,
} from 'models';

import { getTaskVariablesNames } from './getTaskVariablesNames';

const taskVariablesNames = ['HOME', 'APPDATA'];

const tasksTestData: {
  taskPublicKey: string;
  taskMetadataCid: string;
  taskMetadata: TaskMetadata;
}[] = [
  {
    taskPublicKey: '342dkttYwjx2dUPm3Hk2pxxPVhdWaYHVpg4bxEbvzxGr',
    taskMetadataCid: 'test1',
    taskMetadata: {
      author: 'test',
      description: 'test',
      repositoryUrl: 'test',
      createdAt: 123,
      imageUrl: 'test',
      migrationDescription: 'test',
      requirementsTags: [],
    },
  },
  {
    taskPublicKey: '4ZbqVcP95zkhm9HsRWSveCosHjUozPf4QC73ce6Q8TRr',
    taskMetadataCid: 'test2',
    taskMetadata: {
      author: 'test',
      description: 'test',
      repositoryUrl: 'test',
      createdAt: 123,
      imageUrl: 'test',
      migrationDescription: 'test',
      requirementsTags: [
        { type: RequirementType.TASK_VARIABLE, value: taskVariablesNames[0] },
        { type: RequirementType.GLOBAL_VARIABLE, value: taskVariablesNames[1] },
      ],
    },
  },
];

jest.mock('../getTaskInfo', () => ({
  getTaskInfo: jest.fn(
    (
      _: Event,
      { taskAccountPubKey }: GetTaskInfoParam
    ): Promise<Partial<GetTaskInfoResponse>> => {
      const { taskMetadataCid } = tasksTestData.find(
        (task) => task.taskPublicKey === taskAccountPubKey
      )!;
      return Promise.resolve({ metadataCID: taskMetadataCid });
    }
  ),
}));

jest.mock('../getTaskMetadata', () => ({
  getTaskMetadata: jest.fn(
    (
      _: Event,
      { metadataCID }: GetTaskMetadataParam
    ): Promise<TaskMetadata> => {
      const { taskMetadata } = tasksTestData.find(
        (task) => task.taskMetadataCid === metadataCID
      )!;
      return Promise.resolve(taskMetadata);
    }
  ),
}));

describe('getTaskVariablesNames', () => {
  it('returns an empty array if the task source code contains no task variables', async () => {
    const { taskPublicKey } = tasksTestData[0];

    const result = await getTaskVariablesNames({} as Event, {
      taskPublicKey,
    });

    expect(result).toEqual([]);
  });

  it('returns unique (non-repeated) task variables names if they are used in the source code of the task', async () => {
    const { taskPublicKey } = tasksTestData[1];

    const result = await getTaskVariablesNames({} as Event, {
      taskPublicKey,
    });

    expect(result).toEqual(taskVariablesNames);
  });
});
