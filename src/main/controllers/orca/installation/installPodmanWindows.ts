/* eslint-disable @cspell/spellchecker */
/* eslint-disable no-case-declarations */
import { execSync } from 'child_process';
import { existsSync } from 'fs';

import { execCommandAsync } from '../helpers/execCommand';

export async function installPodmanWindows() {
  const installPodmanWinCommand =
    'winget install --id=RedHat.Podman --accept-package-agreements --accept-source-agreements --silent';

  await execCommandAsync(installPodmanWinCommand, 'Podman installation', true);

  const installPath = getInstallPath();
  console.log(`Podman installed at ${installPath}`);
  process.env.PATH = `${installPath};${process.env.PATH}`;
}

function getInstallPath(): string {
  const directories = [
    'C:\\Program Files\\RedHat\\Podman',
    'C:\\Program Files\\Podman',
    'C:\\Program Files (x86)\\RedHat\\Podman',
    'C:\\Program Files (x86)\\Podman',
  ];
  for (const dir of directories) {
    if (existsSync(dir)) {
      return dir;
    }
  }
  console.log(
    "Couldn't find Podman installation directory in common directories, trying with powershell"
  );
  const command =
    'powershell -Command "Get-ChildItem -Path C:\\ -Recurse -Include podman.exe -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName"';
  const result = execSync(command, { encoding: 'utf-8' }).trim();
  if (result) return result;
  console.log('Could not find Podman installation directory with powershell');

  throw new Error('Could not find Podman installation directory');
}
