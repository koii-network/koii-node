/* eslint-disable @cspell/spellchecker */
/* eslint-disable no-case-declarations */

import { execCommandAsync, checkIsInstalled } from '../helpers';

const packageManagers = [
  'apt-get',
  'dnf',
  'yum',
  'pacman',
  'zypper',
  'apk',
] as const;

type PackageManager = (typeof packageManagers)[number];

type PackageManagerCommands = Record<PackageManager, string>;

export async function installPodmanLinux() {
  const packageManager = detectPackageManager();
  if (packageManager === 'unknown') {
    throw new Error('Unsupported package manager');
  }
  await updatePackageManager(packageManager);

  const qemuNames: {
    [key: string]: string;
  } = {
    'apt-get': 'qemu-system-x86',
    dnf: 'qemu-system-x86',
    yum: 'qemu-system-x86',
    pacman: 'qemu',
    zypper: 'qemu',
    apk: 'qemu-system-x86_64',
  };

  const { isInstalled: isQemuInstalled } = checkIsInstalled(
    qemuNames[packageManager]
  );

  if (!isQemuInstalled) {
    const qemuCommands: PackageManagerCommands = {
      'apt-get': 'apt-get install -y qemu-system-x86',
      dnf: 'dnf install -y qemu-system-x86',
      yum: 'yum install -y qemu-system-x86',
      pacman: 'pacman -S --noconfirm qemu',
      zypper: 'zypper install -y qemu',
      apk: 'apk add qemu-system-x86_64',
    };
    await installSoftware('qemu', packageManager, qemuCommands);
  }
  // we've already checked if podman is installed in the main function
  const podmanCommands: PackageManagerCommands = {
    'apt-get': 'apt-get install -y podman',
    dnf: 'dnf install -y podman',
    yum: 'yum install -y podman',
    pacman: 'pacman -S --noconfirm podman',
    zypper: 'zypper install -y podman',
    apk: 'apk add podman',
  };
  await installSoftware('podman', packageManager, podmanCommands);

  const { isInstalled: isGvproxyInstalled } = checkIsInstalled('gvproxy');
  if (!isGvproxyInstalled) {
    await installGvproxy();
  }
}

function detectPackageManager(): PackageManager | 'unknown' {
  return (
    packageManagers.find((pm) => checkIsInstalled(pm).isInstalled) || 'unknown'
  );
}

async function updatePackageManager(packageManager: PackageManager) {
  const updateCommands: PackageManagerCommands = {
    'apt-get': 'apt-get update',
    dnf: 'dnf makecache',
    yum: 'yum makecache',
    pacman: 'pacman -Sy',
    zypper: 'zypper refresh',
    apk: 'apk update',
  };

  const updateCommand = updateCommands[packageManager];
  await execCommandAsync(updateCommand, `${packageManager} update`, true);
}

async function installSoftware(
  software: string,
  packageManager: PackageManager,
  installCommands: PackageManagerCommands
) {
  const installCommand = installCommands[packageManager];
  await execCommandAsync(installCommand, `${software} installation`, true);
}

async function installGvproxy() {
  const installCommand =
    'wget https://github.com/containers/gvisor-tap-vsock/releases/download/v0.6.2/gvproxy-linux -O /usr/libexec/podman/gvproxy';

  const permissionsCommand = 'chmod +x /usr/libexec/podman/gvproxy';
  await execCommandAsync(installCommand, 'gvproxy installation', true);
  await execCommandAsync(
    permissionsCommand,
    'gvproxy: add execute permission',
    true
  );
}
