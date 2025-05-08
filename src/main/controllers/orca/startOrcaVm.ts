const { spawn } = require('child_process');

export const startOrcaVM = async (): Promise<void> => {
  const startCommand = 'podman';
  const args = ['machine', 'start', 'orca'];
  console.log('Running podman start command');
  // Incase the podman was ran before, but not running so running the command behind the scenes
  return new Promise((resolve, reject) => {
    try {
      const child = spawn(startCommand, args);

      child.on('close', (code: any) => {
        handleError(code, '', resolve, reject);
      });

      child.on('exit', (code: any, signal: any) => {
        handleError(code, signal, resolve, reject);
      });
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};
const handleError = (
  code: number,
  signal: string,
  resolve: any,
  reject: any
) => {
  if (code === 0) {
    console.log('Podman started');
    resolve();
  } else {
    console.error(
      `Podman process exited with code ${code} and signal ${signal}`
    );
    reject(new Error(`Podman process exited with code ${code}`));
  }
};
