import {
  Icon,
  KeyUnlockLine,
  CloseLine,
  UploadLine,
  CheckSuccessLine,
} from '@_koii/koii-styleguide';
import React, { memo, useState, ChangeEvent } from 'react';
import { useQueryClient } from 'react-query';

import { AccountsType } from 'renderer/components/ImportFromSeedPhrase';
import { ErrorMessage, Button } from 'renderer/components/ui';
import { ModalContent } from 'renderer/features/modals';
import { createNodeWalletsFromJson } from 'renderer/services';
import { Theme } from 'renderer/types/common';

type PropsType = Readonly<{
  onClose: () => void;
  onImportSuccess: (keys: AccountsType) => void;
}>;

function ImportWithKeyFile({ onClose, onImportSuccess }: PropsType) {
  const queryCache = useQueryClient();

  const [accountName, setAccountName] = useState('');
  const [jsonKey, setJsonKey] = useState<number[]>();
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const onFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e?.target?.files?.[0];
    if (uploadedFile) {
      const fileName = uploadedFile.name;
      if (!fileName.endsWith('.json')) {
        setError('Only .json files can be imported as keys');
        setFileName('');
        setJsonKey([]);
        return;
      }
      setFileName(fileName);
      const fileContent = await uploadedFile.text();
      const keyPhrase = (await JSON.parse(fileContent)) as Array<number>;
      setJsonKey(keyPhrase);
      setError('');
      return;
    }
    setError('Upload a .json file');
  };

  const ondrop = async (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    const uploadedFile = event?.dataTransfer?.files[0];
    if (uploadedFile) {
      const fileName = uploadedFile.name;
      setFileName(fileName);
      const fileContent = await uploadedFile.text();
      const keyPhrase = (await JSON.parse(fileContent)) as Array<number>;
      setJsonKey(keyPhrase);
    }
  };
  const onDragOver = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleImportFromPhrase = async () => {
    if (!accountName) return setError('Account Name Required');
    if (!jsonKey) return setError('key file Required');

    setError('');
    try {
      const accounts = await createNodeWalletsFromJson(jsonKey, accountName);
      queryCache.invalidateQueries();
      onImportSuccess({
        mainAccountPubKey: accounts.mainAccountPubKey,
        accountName,
      });
    } catch (error: any) {
      setError(error);
    }
  };

  return (
    <ModalContent theme={Theme.Dark} className="w-[800px] h-fit pt-4 pb-6">
      <div className="text-white ">
        <div className="flex justify-between p-3">
          <div className="flex items-center justify-between gap-6 pl-6">
            <Icon source={KeyUnlockLine} className="w-7 h-7" />
            <span className="text-[24px]">Import with a key File</span>
          </div>
          <Icon
            source={CloseLine}
            className="w-8 h-8 cursor-pointer"
            onClick={onClose}
          />
          {/*  not sure */}
        </div>

        <div className="flex flex-col w-full p-4 px-14">
          <p className="text-white text-left text-base leading-8 mb-4">
            If you don&apos;t have a secret phrase, import your key here.
          </p>
          <input
            className="w-[360px] px-6 py-2 rounded-md bg-finnieBlue-light-tertiary focus:ring-2 focus:ring-finnieTeal focus:outline-none text-sm focus:bg-finnieBlue-light-secondary"
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Account name"
          />
          <label
            htmlFor="actual-btn"
            className="bg-[rgba(245,245,245,0.15)] w-full h-[167px] mt-4 rounded-lg"
            onDragOver={onDragOver}
            onDrop={ondrop}
          >
            <input
              type="file"
              className=" w-full h-full hidden"
              onChange={onFileUpload}
              id="actual-btn"
            />
            {fileName ? (
              <div className="w-full h-full flex items-center justify-center flex-col text-white text-sm leading-4">
                <Icon
                  source={CheckSuccessLine}
                  className="w-7 h-7 text-finnieEmerald-light"
                />
                <p className="mt-5">{fileName}</p>
                <p className="mt-2 text-finnieEmerald-light">
                  Successfully uploaded
                </p>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center flex-col text-white text-sm leading-4">
                <Icon source={UploadLine} className="w-7 h-7" />
                <p className="mt-5">Click to add a file,</p>
                <p className="mt-2">or drag and drop</p>
              </div>
            )}
          </label>
        </div>

        <div className="w-full flex items-center justify-center flex-col gap-4 pt-4">
          <div className="text-finnieRed text-xs">
            {error && <ErrorMessage error={error} />}
          </div>
          <Button
            onClick={handleImportFromPhrase}
            label="Import"
            className="w-[220px] h-12 rounded-md text-base font-bold bg-[#F5F5F5] text-purple-4"
          />
        </div>
      </div>
    </ModalContent>
  );
}

export default memo(ImportWithKeyFile);
