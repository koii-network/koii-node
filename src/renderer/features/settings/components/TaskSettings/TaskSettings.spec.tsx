/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { screen, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import React from 'react';

import { cloneDeep } from 'lodash';
import {
  TaskVariableData,
  TaskVariableDataWithId,
  TaskVariables,
} from 'models/api';
import { getTasksPairedWithVariable } from 'renderer/services';
import { render } from 'renderer/tests/utils';

import { TaskSettings } from './TaskSettings';

jest.mock('@formkit/auto-animate/react', () => ({
  useAutoAnimate: jest.fn(() => []),
}));

jest.mock('renderer/services', () => {
  const getStoredTaskVariablesInitialState: TaskVariables = {
    id: {
      label: 'my label',
      value: 'my key',
    },
    anotherId: {
      label: 'another label',
      value: 'another key',
    },
  };

  const getStoredTaskVariablesMock = jest
    .fn()
    .mockReturnValue(getStoredTaskVariablesInitialState);

  const getStartedTasksPubKeysMock = jest
    .fn()
    .mockReturnValue(['342dkttYwjx2dUPm3Hk2pxxPVhdWaYHVpg4bxEbvzxGr']);

  return {
    __esModule: true,
    ...jest.requireActual('renderer/services'),
    getStoredTaskVariables: getStoredTaskVariablesMock,
    getStartedTasksPubKeys: getStartedTasksPubKeysMock,
    storeTaskVariable: jest.fn((newTaskVariableData: TaskVariableData) => {
      getStoredTaskVariablesMock.mockReturnValueOnce({
        ...cloneDeep(getStoredTaskVariablesInitialState),
        newId: newTaskVariableData,
      });
    }),
    deleteTaskVariable: jest.fn((taskVariableId: string) => {
      const updatedVariablescopy = cloneDeep(
        getStoredTaskVariablesInitialState
      );
      delete updatedVariablescopy[taskVariableId];
      getStoredTaskVariablesMock.mockReturnValueOnce({
        ...updatedVariablescopy,
      });
    }),
    editTaskVariable: jest.fn(
      ({ id, label, value }: TaskVariableDataWithId) => {
        const updatedVariablescopy = {
          ...cloneDeep(getStoredTaskVariablesInitialState),
          [id]: { label, value },
        };
        getStoredTaskVariablesMock.mockReturnValueOnce({
          ...updatedVariablescopy,
        });
      }
    ),
    getTasksPairedWithVariable: jest.fn(),
  };
});

const getTasksPairedWithVariableMock = getTasksPairedWithVariable as jest.Mock;

const inspectModalDescription =
  'This is placeholder for information about the tool, website, function, etc.';
const editModalDescription = 'Edit information about your Task Extension';
const deleteModalDescription = 'Are you sure you want to delete Task Extension';
const duplicatedLabelErrorMessage =
  'You already have an extension registered with that label';

const existingTaskVariablesData = [
  {
    label: 'my label',
    value: 'my key',
    taskPaired: {
      publicKey: '342dkttYwjx2dUPm3Hk2pxxPVhdWaYHVpg4bxEbvzxGr',
      data: {
        taskName: 'StoreCat Web Scraping',
      },
    },
  },
  {
    label: 'another label',
    value: 'another key',
    taskPaired: {
      publicKey: '442dkttYwjx2dUPm3Hk2pxxPVhdWaYHVpg4bxEbvzxGr',
      data: {
        taskName: 'DID-task-V2',
      },
    },
  },
];

const newTaskVariableData = {
  label: 'new label',
  value: 'new key',
};

describe('TaskSettings', () => {
  describe('Inspect task variable', () => {
    it('displays the right information for each task variable', async () => {
      render(<TaskSettings />);

      for (const existingTaskVariableData of existingTaskVariablesData) {
        const variableItem = await screen.findByText(
          existingTaskVariableData.label
        );
        const inspectItemButton = within(
          variableItem.parentElement!
        ).getByTestId(/inspect-task-variable/i);

        await user.click(inspectItemButton);

        const inspectModal = screen.getByText(inspectModalDescription)
          .parentElement!.parentElement!;
        const label = within(inspectModal).getByText(
          existingTaskVariableData.label
        );
        const key = within(inspectModal).getByText(
          existingTaskVariableData.value
        );

        expect(label).toBeInTheDocument();
        expect(key).toBeInTheDocument();
      }
    });

    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('displays the right paired tasks for a given variable', async () => {
      render(<TaskSettings />);

      for (const existingTaskVariableData of existingTaskVariablesData) {
        getTasksPairedWithVariableMock.mockReturnValueOnce([
          existingTaskVariableData.taskPaired,
        ]);

        const variableItem = await screen.findByText(
          existingTaskVariableData.label
        );
        const inspectItemButton = within(
          variableItem.parentElement!
        ).getByTestId(/inspect-task-variable/i);

        await user.click(inspectItemButton);

        const inspectModal = screen.getByText(inspectModalDescription)
          .parentElement!.parentElement!;
        const taskPairedWithVariable = within(inspectModal).getByText(
          existingTaskVariableData.taskPaired.data.taskName
        );

        expect(taskPairedWithVariable).toBeInTheDocument();
      }
    });
  });

  describe('Add task variable', () => {
    it('displays the proper error and disables the Add button if the label entered is not valid', async () => {
      const existingTaskVariableData = existingTaskVariablesData[0];
      render(<TaskSettings />);

      const variableLabelInput = screen.getByPlaceholderText(/Add Label/i);

      await user.type(variableLabelInput, existingTaskVariableData.label);

      const labelError = await screen.findByText(duplicatedLabelErrorMessage, {
        exact: false,
      });
      const addButton = screen.getByRole('button', { name: /Add/i });

      expect(labelError).toBeInTheDocument();
      expect(addButton).toBeDisabled();
    });

    it('disables the Add button if there is no label or key value entered, and enables it when both are there (and the label is valid)', async () => {
      render(<TaskSettings />);

      const variableLabelInput = screen.getByPlaceholderText(/Add Label/i);

      const addButton = screen.getByRole('button', { name: /Add/i });
      expect(addButton).toBeDisabled();

      await user.type(variableLabelInput, newTaskVariableData.label);

      expect(addButton).toBeDisabled();

      const variableKeyInput = screen.getByPlaceholderText(/Type key here/i);

      await user.type(variableKeyInput, newTaskVariableData.value);

      expect(addButton).not.toBeDisabled();
    });

    it('successfully adds a new variable if the label and key entered are valid, cleans the inputs and adds a new item for the variable in ManageYourTools', async () => {
      render(<TaskSettings />);

      const variableLabelInput = screen.getByPlaceholderText(/Add Label/i);

      await user.type(variableLabelInput, newTaskVariableData.label);

      const variableKeyInput = screen.getByPlaceholderText(/Type key here/i);

      await user.type(variableKeyInput, newTaskVariableData.value);

      const addButton = screen.getByRole('button', { name: /Add/i });
      await user.click(addButton);

      const newVariableItem = screen.getByText(newTaskVariableData.label);

      expect(variableLabelInput).toHaveDisplayValue('');
      expect(variableKeyInput).toHaveDisplayValue('');
      expect(newVariableItem).toBeInTheDocument();
    });
  });

  describe('Delete task variable', () => {
    it('closes the delete modal and keeps the variable item, when clicking on Keep', async () => {
      const existingTaskVariableData = existingTaskVariablesData[0];
      render(<TaskSettings />);

      const variableItem = screen.getByText(existingTaskVariableData.label);
      const deleteItemButton = within(variableItem.parentElement!).getByTestId(
        /delete-task-variable/i
      );

      await user.click(deleteItemButton);

      const deleteModal = screen.getByText(deleteModalDescription)
        .parentElement!.parentElement!;
      const keepButton = within(deleteModal).getByRole('button', {
        name: /Keep/i,
      });

      await user.click(keepButton);

      expect(deleteModal).not.toBeInTheDocument();
      expect(variableItem).toBeInTheDocument();
    });

    // eslint-disable-next-line jest/no-commented-out-tests
    // it('successfully deletes a task variable', async () => {
    //   const existingTaskVariableData = existingTaskVariablesData[0];
    //   render(<TaskSettings />);
    //
    //   const variableItem = screen.getByText(existingTaskVariableData.label);
    //   const deleteItemButton = within(variableItem.parentElement!).getByTestId(
    //     /delete-task-variable/i
    //   );
    //
    //   await user.click(deleteItemButton);
    //
    //   const deleteModal = screen.getByText(deleteModalDescription)
    //     .parentElement!.parentElement!;
    //   const deleteButton = within(deleteModal).getByRole('button', {
    //     name: /Delete/i,
    //   });
    //
    //   await user.click(deleteButton);
    //
    //   await waitForElementToBeRemoved(variableItem);
    // });
  });
});
describe('Edit task variable', () => {
  it('displays the proper error and disables the Save button if the label entered is not valid', async () => {
    const existingTaskVariableData = existingTaskVariablesData[1];
    render(<TaskSettings />);

    const variableItem = screen.getByText(existingTaskVariableData.label);
    const editItemButton = within(variableItem.parentElement!).getByTestId(
      /edit-task-variable/i
    );

    await user.click(editItemButton);

    const editModal =
      screen.getByText(editModalDescription).parentElement!.parentElement!;
    const variableLabelInput = within(editModal).getByDisplayValue(
      existingTaskVariableData.label
    );
    const saveButton = screen.getByRole('button', { name: /Save/i });

    await user.clear(variableLabelInput);
    await user.type(variableLabelInput, 'my label');

    const labelError = await screen.findByText(duplicatedLabelErrorMessage, {
      exact: false,
    });

    expect(labelError).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it('disables the Save button if there is no label or key value entered, and enables it when both are there (and the label is valid)', async () => {
    const existingTaskVariableData = existingTaskVariablesData[1];
    render(<TaskSettings />);

    const variableItem = screen.getByText(existingTaskVariableData.label);
    const editItemButton = within(variableItem.parentElement!).getByTestId(
      /edit-task-variable/i
    );

    await user.click(editItemButton);

    const editModal =
      screen.getByText(editModalDescription).parentElement!.parentElement!;
    const variableLabelInput = within(editModal).getByDisplayValue(
      existingTaskVariableData.label
    );
    const variableKeyInput = screen.getByDisplayValue(
      existingTaskVariableData.value
    );
    const saveButton = screen.getByRole('button', {
      name: /Save Settings/i,
    });

    await user.clear(variableLabelInput);
    await user.clear(variableKeyInput);

    expect(saveButton).toBeDisabled();

    await user.type(variableLabelInput, newTaskVariableData.label);

    expect(saveButton).toBeDisabled();

    await user.type(variableKeyInput, newTaskVariableData.value);

    expect(saveButton).not.toBeDisabled();
  });

  it('edits correctly a task variable', async () => {
    const existingTaskVariableData = existingTaskVariablesData[1];
    render(<TaskSettings />);

    const variableItem = screen.getByText(existingTaskVariableData.label);
    const editItemButton = within(variableItem.parentElement!).getByTestId(
      /edit-task-variable/i
    );

    await user.click(editItemButton);

    const editModal =
      screen.getByText(editModalDescription).parentElement!.parentElement!;
    const variableLabelInput =
      within(editModal).getByPlaceholderText(/Add Label/i);

    await user.clear(variableLabelInput);
    await user.type(variableLabelInput, newTaskVariableData.label);

    const variableKeyInput =
      within(editModal).getByPlaceholderText(/Type key here/i);

    await user.clear(variableKeyInput);
    await user.type(variableKeyInput, newTaskVariableData.value);

    const saveButton = within(editModal).getByRole('button', {
      name: /Save Settings/i,
    });
    await user.click(saveButton);

    const updatedItem = screen.getByText(newTaskVariableData.label);
    const inspectItemButton = within(updatedItem.parentElement!).getByTestId(
      /inspect-task-variable/i
    );

    await user.click(inspectItemButton);

    const inspectModal = screen.getByText(inspectModalDescription)
      .parentElement!.parentElement!;

    const label = within(inspectModal).getByText(newTaskVariableData.label);
    const key = within(inspectModal).getByText(newTaskVariableData.value);

    expect(label).toBeInTheDocument();
    expect(key).toBeInTheDocument();
  });
});
