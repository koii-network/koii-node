import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import proxy from 'express-http-proxy';
import { handleCardClick } from 'main/controllers/taskVariables/cardClickHandler';
import { createTaskVariable } from 'main/controllers/taskVariables/createTaskVariableLink';
import { getStoredTaskVariables } from 'main/controllers/taskVariables/getStoredTaskVariables';
import { getLandingPageContent } from 'main/controllers/taskVariables/landingPage';
import koiiState from 'main/services/koiiState';
import koiiTasks from 'main/services/koiiTasks';

import { getAppDataPath } from '../helpers/getAppDataPath/getAppDataPath';

import routes from './routes';

const ATTENTION_TASK_ID = 'Attention22222222222222222222222222222222222';

const verifyTaskEndpoints = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const match = req.originalUrl.match(/\/(.*?)\//i);

  let taskActivated = false;
  let isTask = false;

  if (match) {
    const taskId = match[1];
    if (taskId?.length === 43) {
      isTask = true;
      taskActivated = !koiiState.getAddedTasks().every((addedTask) => {
        return addedTask.contractId !== taskId || !addedTask.activated;
      });
    }
  }

  if (!taskActivated && isTask) {
    res.status(400).send('This service has been stopped.');
  } else {
    next();
  }
};

export default (): Express => {
  const app = express();
  console.log(
    'static file path given to server:',
    `${getAppDataPath()}/PUBLIC_STATIC_IMMUTABLE`
  );
  app.use(express.static(`${getAppDataPath()}/PUBLIC_STATIC_IMMUTABLE`));
  // Create alias for first task with name "Attention_Game" to /attention
  const alias = '/attention';
  app.all(`${alias}*`, function (req, _res, next) {
    if (!req.originalUrl.includes(ATTENTION_TASK_ID)) {
      req.url = `/task/${ATTENTION_TASK_ID}${req.originalUrl.slice(
        alias.length
      )}`;
      req.originalUrl = `/task/${ATTENTION_TASK_ID}${req.originalUrl.slice(
        alias.length
      )}`;
    }

    next();
  });
  app.use(
    '/task/:taskid/*',
    taskChecker,
    proxy(
      function (req: any) {
        const taskId = req.params.taskid;
        if (koiiTasks.RUNNING_TASKS[taskId]) {
          console.log(
            `http://localhost:${koiiTasks.RUNNING_TASKS[taskId].expressAppPort}`
          );
          return `http://localhost:${koiiTasks.RUNNING_TASKS[taskId].expressAppPort}`;
        }
        return 'http://localhost:8080';
      },
      {
        proxyReqPathResolver(req: any) {
          const taskId = req.params.taskid;
          const url = req.originalUrl.replace(`/task/${taskId}`, '');
          console.log({ url });
          return url;
        },
      }
    )
  );
  app.use(cors());
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(express.json({ limit: '50mb' }));
  app.use(cookieParser());

  // Add landing page route
  app.use('/task-helper', (req, res) => {
    res.send(getLandingPageContent());
  });

  // Add card click handler routes
  app.post('/api/card-click/:cardType', handleCardClick);

  // Add auth routes
  app.get('/api/auth/github', (req, res) => {
    // Coming soon
    res.json({ success: true });
  });

  app.post('/api/auth/anthropic', (req, res) => {
    // Coming soon
    res.json({ success: true });
  });

  app.use('/api/task-variables', createTaskVariable);
  app.use('/api/task-variables-check', async (req, res) => {
    try {
      const storedTaskVariables = await getStoredTaskVariables();
      const hasGithubToken = Object.values(storedTaskVariables).some(
        (variable) => variable.label === 'GITHUB_TOKEN'
      );
      const hasGithubUsername = Object.values(storedTaskVariables).some(
        (variable) => variable.label === 'GITHUB_USERNAME'
      );
      const hasGithub = hasGithubToken && hasGithubUsername;

      // Check for Claude setup
      const hasClaude = Object.values(storedTaskVariables).some(
        (variable) => variable.label === 'ANTHROPIC_API_KEY'
      );

      // Check for Gemini setup
      const hasGemini = Object.values(storedTaskVariables).some(
        (variable) => variable.label === 'GEMINI_API_KEY'
      );

      // Check for Grok setup
      const hasGrok = Object.values(storedTaskVariables).some(
        (variable) => variable.label === 'GROK_API_KEY'
      );

      res.json({
        success: true,
        data: { hasGithub, hasClaude, hasGemini, hasGrok },
      });
    } catch (error) {
      res.json({
        success: false,
        error: 'Failed to check task variables',
        errorMessage: error,
      });
    }
  });
  app.use(verifyTaskEndpoints);

  routes(app);

  return app;
};

function taskChecker(req: any, res: any, next: any) {
  const taskId = req.params.taskid;
  if (req.params['0'] === 'id')
    return res.json({
      taskId,
    });
  if (koiiTasks.RUNNING_TASKS[taskId]) {
    return next();
  }
  return res.status(422).send({ message: `Task ${taskId} not running` });
}
