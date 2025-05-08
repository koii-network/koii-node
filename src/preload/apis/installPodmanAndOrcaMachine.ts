import config from 'config';
import sendMessage from 'preload/sendMessage';

export const installPodmanAndOrcaMachine = async () =>
  sendMessage(config.endpoints.INSTALL_PODMAN_AND_ORCA_MACHINE, {});
