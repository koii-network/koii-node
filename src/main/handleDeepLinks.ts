import { dialog, shell } from 'electron';

import { RendererEndpoints } from 'config/endpoints';
import { DeepLinkRoute } from 'renderer/types/routes';
import { sendEventAllWindows } from 'utils/sendEventAllWindows';

import { storeTaskVariable } from './controllers';
import { signMessageWithSystemWallet } from './util';

const allowedAppRoutes = Object.values(DeepLinkRoute);
function checkIfRouteIsValid(route: string): boolean {
  return allowedAppRoutes.includes(route);
}

export const handleDeepLinks = async (argv: string[]) => {
  console.log('- DEEP LINK -', { argv });
  for (const arg of argv) {
    if (arg.startsWith('koii-node://')) {
      const deepLink = arg;
      const url = new URL(deepLink);
      const searchParams = new URLSearchParams(url.search);

      const action = url.host;
      console.log({ deepLink });

      switch (action) {
        case 'open': {
          const route = searchParams.get('route') || '';
          const isValidRoute = route && checkIfRouteIsValid(route);
          console.log({ route, isValidRoute });

          if (isValidRoute) {
            sendEventAllWindows(RendererEndpoints.NAVIDATE_TO_ROUTE, route);
          }
          break;
        }
        case 'sign-message': {
          const data = searchParams.get('data') || '';
          const callbackURL = searchParams.get('callback');
          console.log({ action, data, callbackURL });
          dialog
            .showMessageBox({
              title: 'Requesting to sign message',
              message: `Action: ${action}`,
              type: 'info',
              buttons: ['Sign', 'Cancel'],
            })
            .then(async (response) => {
              const buttonIndex = response.response;
              let signedMessage;
              switch (buttonIndex) {
                case 0:
                  console.log('SIGNED BUTTON CALLED');
                  signedMessage = await signMessageWithSystemWallet(data);
                  if (callbackURL) {
                    const callbackURLWithParams = `${callbackURL}?signedMessage=${signedMessage}`;
                    console.log('callbackURLWithParams', callbackURLWithParams);
                    shell.openExternal(callbackURLWithParams);
                  }
                  break;
                default:
                  console.log('CANCEL BUTTON CALLED');
                  break;
              }
            });
          break;
        }
        case 'store-variable': {
          const variableName = searchParams.get('variableName') || '';
          const variableValue = searchParams.get('variableValue') || '';

          dialog
            .showMessageBox({
              title: `Requesting to store variable ${variableName}`,
              message: `Action: ${action}`,
              type: 'info',
              buttons: ['Store', 'Cancel'],
            })
            .then(async (response) => {
              const buttonIndex = response.response;
              switch (buttonIndex) {
                case 0:
                  storeTaskVariable({} as Event, {
                    label: variableName,
                    value: variableValue,
                  });
                  break;
                default:
                  console.log('CANCEL BUTTON CALLED');
                  break;
              }
            });
          break;
        }
        default: {
          break;
        }
      }
    }
  }
};
