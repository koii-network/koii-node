import { BrowserWindow } from 'electron';

import { RendererEndpoints } from 'config/endpoints';
import { Request, Response } from 'express';
import { namespaceInstance } from 'main/node/helpers/Namespace';
import { TaskVariableData, TaskVariables } from 'models';
// eslint-disable-next-line @cspell/spellchecker
import { v4 as uuidv4 } from 'uuid';

import { PersistentStoreKeys } from '../types';

import { getStoredTaskVariables } from './getStoredTaskVariables';

export const createTaskVariable = async (req: Request, res: Response) => {
  try {
    const taskVariable: TaskVariableData = req.body;

    // Validate required fields
    if (!taskVariable.label || !taskVariable.value) {
      return res.status(400).json({
        error: 'Missing required fields: label and value are required',
      });
    }

    // Get existing task variables
    const existingVariables = await getStoredTaskVariables();

    // Check for duplicate labels
    const isDuplicateLabel = Object.values(existingVariables).some(
      (variable) => variable.label === taskVariable.label
    );
    if (isDuplicateLabel) {
      return res.status(400).json({
        error: `Task variable with label "${taskVariable.label}" already exists`,
      });
    }

    // Generate new ID and add to existing variables
    const newId = uuidv4();
    const newTaskVariables: TaskVariables = {
      ...existingVariables,
      [newId]: taskVariable,
    };

    // Store updated variables
    await namespaceInstance.storeSet(
      PersistentStoreKeys.TaskVariables,
      JSON.stringify(newTaskVariables)
    );

    try {
      const appWindow = BrowserWindow.getAllWindows()[0];
      appWindow?.webContents.send(RendererEndpoints.TASK_VARIABLES_UPDATED);
    } catch (e) {
      console.error(e);
    }

    res.json({
      success: true,
      id: newId,
      taskVariable,
    });
  } catch (error) {
    console.error('Error creating task variable:', error);
    res.status(500).json({
      error: 'Failed to create task variable',
    });
  }
};
