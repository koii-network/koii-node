import { Request, Response, Express } from 'express';
import koiiTasks from 'main/services/koiiTasks';

import helpers from '../helpers';

const heartbeat = (req: Request, res: Response): void => {
  res.json({ status: 'OK', message: 'Node is running' });
};

async function nodes(req: Request, res: Response) {
  try {
    const { taskId } = req.params;
    if (!taskId) res.status(200).send({ message: 'No taskId was selected' });
    const nodes = await helpers.getNodes(taskId);
    res.status(200).send(nodes);
  } catch (e) {
    console.error('Error during "nodes" request:', e);
    res.status(500).send({ error: `ERROR: ${e}` });
  }
}

const registerNode = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    console.log('Register Node called for task:', taskId, req?.body?.owner);
    const regRes = await helpers.regNodes([req.body], taskId);
    if (regRes) res.status(200).end();
    else
      res.status(409).json({
        message: 'Registration is duplicate, outdated, or invalid',
      });
  } catch (e) {
    console.error('Error during "register-node" request:', e);
    res.status(500).send({ error: `ERROR: ${e}` });
  }
};

export default (app: Express) => {
  app.get('/', heartbeat);
  app.get('/nodes/:taskId', nodes);
  app.post('/register-node/:taskId', registerNode);
  app.post('/namespace-wrapper', async (req, res) => {
    if (!req.body.args)
      return res.status(422).send({ message: 'No args provided' });
    if (!req.body.taskId)
      return res.status(422).send({ message: 'No taskId provided' });
    if (!req.body.secret)
      return res.status(422).send({ message: 'No secret provided' });

    const { args } = req.body;
    const { taskId } = req.body;
    if (koiiTasks.RUNNING_TASKS[taskId].secret !== req.body.secret) {
      return res.status(401).send({ message: 'Invalid secret provided' });
    }
    try {
      const params = args.slice(1);
      const response = await (koiiTasks.RUNNING_TASKS[taskId] as any).namespace[
        args[0]
      ](...params);
      return res.status(200).send({ response });
    } catch (err: any) {
      return res.status(422).send({ message: err.message });
    }
  });
};
