import { execCommandAsync, checkIsInstalled } from '../helpers';

export async function installPodmanMac() {
  let brewPath: string;
  try {
    ({ path: brewPath } = checkIsInstalled('brew'));
    brewPath = brewPath.trim();
  } catch (error) {
    console.error(error);
    const installBrewCommand =
      '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"';
    try {
      await execCommandAsync(installBrewCommand, 'Homebrew installation', true);
      await execCommandAsync(
        'echo \'export PATH="/opt/homebrew/bin:$PATH"\' >> ~/.zshrc',
        'Add homebrew to PATH (Silicon)'
      );
      await execCommandAsync(
        'echo \'export PATH="/usr/local/bin:$PATH"\' >> ~/.zshrc',
        'Add homebrew to PATH (Intel)'
      );
      await execCommandAsync('source ~/.zshrc', 'Homebrew source');
      ({ path: brewPath } = checkIsInstalled('brew'));
      brewPath = brewPath.trim();
    } catch (error) {
      console.error('Error installing Homebrew');
      throw new Error('Error installing Homebrew');
    }
  }
  const installPodmanMacCommand = `${brewPath} install podman`;

  await execCommandAsync(installPodmanMacCommand, 'Podman installation');
}
