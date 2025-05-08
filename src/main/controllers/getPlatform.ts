const os = require('os');

export const getPlatform = async (): Promise<{
  platform: string;
  image: string;
}> => {
  const platform = os.platform();
  let image = 'supported';

  const appInstalledViaDebPackage =
    platform === 'linux' && !process.env.APPIMAGE;

  if (appInstalledViaDebPackage) {
    image = 'unsupported';
  }

  return {
    platform,
    image,
  };
};
