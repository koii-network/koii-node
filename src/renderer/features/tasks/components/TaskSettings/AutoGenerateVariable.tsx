/* eslint-disable react/destructuring-assignment */
import React, { useCallback, useMemo, useState } from 'react';
import { Toast, toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from 'react-query';

import EmailIcon from 'assets/svgs/email-icon.svg';
import PuzzleIcon from 'assets/svgs/puzzle-icon.svg';
import axios from 'axios';
import config from 'config';
import { FAUCET_UTM_PARAMS } from 'config/faucet';
import {
  RetrievalInfo,
  RetrievalInfoActionType,
  TaskVariableDataWithId,
} from 'models';
import { LoadingSpinner } from 'renderer/components/ui';
import { useTaskVariable } from 'renderer/features/common';
import { useMainAccount, useStakingAccount } from 'renderer/features/settings';
import { QueryKeys, openBrowserWindow } from 'renderer/services';

interface Props {
  retrievalInfo: string;
  variableLabel: string;
  dropdownHasAValueSelected: boolean;
}

export function AutoGenerateVariable({
  retrievalInfo,
  variableLabel,
  dropdownHasAValueSelected,
}: Props) {
  const { data: mainAccountPubKey = '' } = useMainAccount();
  const { data: stakingAccountPublicKey = '' } = useStakingAccount();
  const [hasToVerifyEmail, setHasToVerifyEmail] = useState(false);
  const [errorToastId, setErrorToastId] = useState('');

  const queryClient = useQueryClient();

  const { handleAddTaskVariable } = useTaskVariable({
    onSuccess: async () => {
      await queryClient.invalidateQueries([QueryKeys.StoredTaskVariables]);
    },
    taskVariable: { label: variableLabel } as TaskVariableDataWithId,
  });

  const availableParamValues = useMemo(
    () => ({
      SYSTEM_WALLET_PUBLIC_KEY: mainAccountPubKey,
      STAKING_WALLET_PUBLIC_KEY: stakingAccountPublicKey,
    }),
    [mainAccountPubKey, stakingAccountPublicKey]
  );

  const parseRetrievalInfo = useCallback(
    (retrievalInfo: string): RetrievalInfo => {
      const [url, actionType, params] = retrievalInfo.split(';');

      return {
        url,
        actionType: actionType as RetrievalInfoActionType,
        params: params.split(','),
      };
    },
    []
  );

  const getRequestParams = useCallback(
    (p: string) => {
      const paramValue =
        availableParamValues[p as keyof typeof availableParamValues] || '';

      return [p, paramValue];
    },
    [availableParamValues]
  );

  const handleRequest = useCallback(
    async (method: 'GET' | 'POST', info: RetrievalInfo) => {
      const data = Object.fromEntries(info.params.map(getRequestParams));
      const requestData = method === 'GET' ? { params: data } : data;
      const response = await axios({
        method,
        url: info.url,
        ...requestData,
      });
      handleAddTaskVariable(response.data.API_KEY);
    },
    [getRequestParams, handleAddTaskVariable]
  );

  const actionHandlers: {
    [key in RetrievalInfoActionType]: (info: RetrievalInfo) => Promise<void>;
  } = useMemo(() => {
    return {
      [RetrievalInfoActionType.GET]: (info: RetrievalInfo) =>
        handleRequest('GET', info),
      [RetrievalInfoActionType.POST]: (info: RetrievalInfo) =>
        handleRequest('POST', info),
      [RetrievalInfoActionType.BROWSER]: async (info: RetrievalInfo) => {
        openBrowserWindow(info.url);
      },
    };
  }, [handleRequest]);

  const verifyEmailInFaucet = async () => {
    await window.main.verifyMessage({});
    const urlToFaucet = `${config.faucet.FAUCET_URL}?key=${mainAccountPubKey}&${FAUCET_UTM_PARAMS}`;
    openBrowserWindow(urlToFaucet);
  };

  const pickAndRunCorrespondingHandler =
    useCallback(async (): Promise<void> => {
      const info = parseRetrievalInfo(retrievalInfo);
      const handler = actionHandlers[info.actionType];
      if (!handler) {
        throw new Error(`Unsupported action type: ${info.actionType}`);
      }
      await handler(info);
    }, [retrievalInfo, parseRetrievalInfo, actionHandlers]);

  const {
    mutate: getKeyAndStoreTaskVariable,
    isLoading: isGeneratingAndPairing,
  } = useMutation(pickAndRunCorrespondingHandler, {
    onSuccess: async () => {
      setErrorToastId('');
      await queryClient.invalidateQueries([QueryKeys.StoredTaskVariables]);
      if (dropdownHasAValueSelected) {
        toast.error(
          "There's already a setting paired to this item. Manually select the new key to pair it."
        );
      } else {
        const successMessage = `${variableLabel} successfully integrated!`;
        toast.success(successMessage);
      }
    },
    onError: (error: any) => {
      const hasToVerifyEmail =
        error.response.data.message.includes('No past history found') ||
        error.response.data.message.includes(
          'Please verify your email in faucet'
        );
      const errorMessage = (t: Toast) =>
        hasToVerifyEmail ? (
          <div>
            {/* eslint-disable-next-line @cspell/spellchecker */}
            It looks like you need to verify your email to integrate Spheron.
            Click{' '}
            <button
              className="font-bold"
              onClick={() => {
                verifyEmailInFaucet();
                toast.dismiss(t.id);
                setHasToVerifyEmail(false);
              }}
            >
              Verify
            </button>{' '}
            to continue.
          </div>
        ) : error.response.data.message.includes('You have already claimed') ? (
          "You have already claimed this key. Please click on 'Select item' and pick an existing extension from the dropdown."
        ) : (
          'Something went wrong. Please try again later.'
        );
      const toastOptions = hasToVerifyEmail ? { duration: 30000 } : {};
      // const toastId = toast.error(errorMessage, {
      const toastId = toast.error((t) => errorMessage(t), toastOptions);
      if (hasToVerifyEmail) {
        setErrorToastId(toastId);
        setHasToVerifyEmail(true);
      }
    },
  });

  const buttonText = hasToVerifyEmail ? 'Verify' : 'Get Key';
  const buttonAction = hasToVerifyEmail
    ? () => {
        verifyEmailInFaucet();
        if (errorToastId) toast.dismiss(errorToastId);
        setHasToVerifyEmail(false);
      }
    : () => getKeyAndStoreTaskVariable();
  const Icon = hasToVerifyEmail ? EmailIcon : PuzzleIcon;

  return isGeneratingAndPairing ? (
    <LoadingSpinner className="w-10 h-10" />
  ) : (
    <button
      className="text-white cursor-pointer mt-2.5 flex items-center gap-3"
      onClick={buttonAction}
    >
      <Icon />{' '}
      <span
        className={`underline font-semibold ${
          hasToVerifyEmail ? 'text-finnieOrange' : ''
        }`}
      >
        {buttonText}
      </span>
    </button>
  );
}
