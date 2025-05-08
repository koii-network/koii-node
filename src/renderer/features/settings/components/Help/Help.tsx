import { CheckSuccessLine, CopyLine, Icon } from '@_koii/koii-styleguide';
import React, { useEffect, useState } from 'react';

import FolderIcon from 'assets/svgs/folder-icon.svg';
import { Button } from 'renderer/components/ui';
import { Tooltip } from 'renderer/components/ui/Tooltip';
import { useAppVersion, useClipboard } from 'renderer/features/common/hooks';
import {
  useMainAccount,
  useStakingAccount,
} from 'renderer/features/settings/hooks';

import { SectionHeader } from '../SectionHeader';
import { Spacer } from '../Spacer';

import { BugReport } from './BugReport';
import { DiscordButton } from './DiscordButton';
import { FAQButton } from './FAQButton';
import { StartNodeTourButton } from './StartNodeTourButton';
import { WatchVideoButton } from './WatchVideoButton';

export function Help() {
  const openNodeLogfileFolder = () => {
    console.log('open');
    window.main.openNodeLogfileFolder();
  };

  const { copyToClipboard: copyKeyPair, copied: hasCopiedKeyPair } =
    useClipboard();
  const { copyToClipboard: copyNodeVersion, copied: hasCopiedNodeVersion } =
    useClipboard();

  const { data: mainAccountPublicKey } = useMainAccount();
  const { data: stakingAccountPublicKey } = useStakingAccount();
  const { appVersion } = useAppVersion();

  const keyPair = `System Key: ${mainAccountPublicKey}, Staking Key: ${stakingAccountPublicKey}`;
  const copyKeyPairToClipboard = () => copyKeyPair(keyPair);
  const copyNodeVersionToClipboard = () =>
    appVersion && copyNodeVersion(appVersion);

  const [discordButtonClickCount, setDiscordButtonClickCount] = useState(0);
  const [showSection, setShowSection] = useState(false);

  useEffect(() => {
    if (discordButtonClickCount >= 2) {
      const timer = setTimeout(() => setShowSection(true), 50); // Delay the visibility
      return () => clearTimeout(timer);
    } else {
      setShowSection(false);
    }
  }, [discordButtonClickCount]);

  const handleDiscordButtonClick = () => {
    setDiscordButtonClickCount((prevCount) => prevCount + 1);
  };

  return (
    <div className="overflow-y-auto text-white">
      <SectionHeader title="Need Help?" />

      <div className="mb-2 text-lg font-semibold">Check the FAQ</div>
      <p className="text-sm">
        Check our FAQ to see if your question has already been answered.
      </p>
      <FAQButton />
      <Spacer showSeparator />

      <div className="mb-2 text-lg font-semibold ">Contact Us on Discord</div>
      <p className="text-sm">
        Head to our Discord and open a ticket; it&apos;s the fastest way to get
        in touch with someone from our team and receive help.
      </p>
      <DiscordButton onClick={handleDiscordButtonClick} />
      <Spacer showSeparator />

      {discordButtonClickCount >= 2 && (
        <div
          className={`transition-opacity duration-500 ease-in ${
            showSection ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="mb-2 text-lg font-semibold">
            Trouble on using Discord?
          </div>
          <p className="text-sm">
            If you are having trouble on using Discord, you can submit a bug
            report form to us.
          </p>
          <BugReport />
          <Spacer showSeparator />
        </div>
      )}
      <div className="mb-2 text-lg font-semibold">
        Please prepare your:
        <div className="text-sm grid grid-cols-[1fr_2fr] items-center gap-1 gap-y-1">
          <p>
            System Key:{' '}
            {`${mainAccountPublicKey?.substring(
              0,
              5
            )}...${mainAccountPublicKey?.substring(
              mainAccountPublicKey.length - 6,
              mainAccountPublicKey.length
            )}`}
            , Staking Key:{' '}
            {`${stakingAccountPublicKey?.substring(
              0,
              5
            )}...${stakingAccountPublicKey?.substring(
              stakingAccountPublicKey.length - 6,
              stakingAccountPublicKey.length
            )}`}
          </p>

          <Button
            onClick={copyKeyPairToClipboard}
            label={hasCopiedKeyPair ? 'Copied' : 'Copy'}
            className="text-white bg-purple-3 w-[110px] py-1.5 text-sm my-1 rounded"
            icon={
              <Icon
                source={hasCopiedKeyPair ? CheckSuccessLine : CopyLine}
                className="w-4 h-4"
              />
            }
          />

          <p>Node version: {appVersion}</p>

          <Button
            onClick={copyNodeVersionToClipboard}
            label={hasCopiedNodeVersion ? 'Copied' : 'Copy'}
            className="text-white bg-purple-3 w-[110px] py-1.5 text-sm my-1 rounded"
            icon={
              <Icon
                source={hasCopiedNodeVersion ? CheckSuccessLine : CopyLine}
                className="w-4 h-4"
              />
            }
          />

          <p>
            Node &apos;main.log&apos; file or{' '}
            <Tooltip
              placement="right"
              tooltipContent="You can find your task.log file by clicking the menu icon to the right of your tasks."
            >
              <span className="cursor-help">Task log file (?)</span>
            </Tooltip>
          </p>
          <Button
            onClick={openNodeLogfileFolder}
            label="Browse"
            className="text-white bg-purple-3 w-[110px] py-1.5 text-sm my-1 rounded"
            icon={<FolderIcon className="w-4 h-4" />}
          />
          <p className="py-4">
            Screenshots,{' '}
            <Tooltip
              placement="right"
              tooltipContent="Expand a task and click on 'Copy task ID' to copy its ID."
            >
              <span className="cursor-help">Task IDs (?) </span>
            </Tooltip>
            and the time the node has been running are also helpful!
          </p>
        </div>
      </div>

      <div className="hidden">
        <div className="mb-2 text-lg font-semibold">
          Not sure where to start?{' '}
        </div>
        <p className="text-sm">
          Check this basic tutorials on some functionalities of the node to get
          you started on the basics
        </p>
        <div className="flex gap-4">
          <StartNodeTourButton />
          <WatchVideoButton />
        </div>
      </div>
    </div>
  );
}
