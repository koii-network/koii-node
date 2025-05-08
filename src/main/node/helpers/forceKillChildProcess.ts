/* eslint-disable @cspell/spellchecker */
import { ChildProcess, exec } from 'child_process';

export const forceKillChildProcess = (childProcess: ChildProcess) => {
  console.log('Killing the process:', childProcess.pid);

  const command = `${
    process.platform !== 'win32' ? 'kill -9' : 'taskkill /F /PID'
  } ${childProcess.pid}`;

  exec(command, () => {
    console.log(`Process ${childProcess.pid} terminated`);
  });
};
