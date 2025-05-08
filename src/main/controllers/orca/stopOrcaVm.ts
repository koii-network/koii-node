const { exec } = require('child_process');

export const stopOrcaVM = async (): Promise<void> => {
  const stopCommand = 'podman machine stop orca';
  console.log('Running podman stop command');
  return new Promise((resolve, reject) => {
    try {
      exec(stopCommand, (error: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};
