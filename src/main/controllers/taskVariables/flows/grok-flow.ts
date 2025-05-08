import axios from 'axios';
import { connect } from 'puppeteer-real-browser';

declare global {
  interface Window {
    flowInProgress: boolean;
  }
}

export async function handleGrokFlow() {
  try {
    const { page } = await connect({
      headless: false,

      args: [],

      customConfig: {},

      turnstile: true,

      connectOption: {},

      disableXvfb: false,
      ignoreAllFlags: false,
      // proxy:{
      //     host:'<proxy-host>',
      //     port:'<proxy-port>',
      //     username:'<proxy-username>',
      //     password:'<proxy-password>'
      // }
    });

    // Set viewport to a larger size
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto('https://console.x.ai/team');

    // Wait for the page to be fully loaded
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Check if we're on the sign-in page
    const initialUrl = await page.url();
    if (initialUrl.includes('accounts.x.ai/sign-in?redirect=cloud-console')) {
      console.log('We are on the sign-in page');
      // Wait for the Google sign-in button to appear
      await new Promise((resolve) => {
        setTimeout(resolve, 3000);
      });

      // Highlight the Google sign-in button and add hint
      await page.evaluate(() => {
        // Find all buttons and filter for the Google sign-in button
        const buttons = Array.from(
          document.querySelectorAll('button[type="button"]')
        );
        const googleButton = buttons.find((button) => {
          const textElement = button.querySelector('p.text-regular');
          return (
            textElement &&
            textElement.textContent?.includes('Sign in with Google')
          );
        });

        if (googleButton) {
          // Add enhanced flashing border animation to the button
          (googleButton as HTMLElement).style.cssText = `
          border: 3px solid #4CAF50 !important;
          animation: enhancedFlash 0.5s infinite !important;
          position: relative !important;
        `;

          // Add enhanced flash animation
          const style = document.createElement('style');
          style.textContent = `
          @keyframes enhancedFlash {
            0% { 
              border-color: #4CAF50;
              box-shadow: 0 0 5px #4CAF50;
            }
            50% { 
              border-color: #8BC34A;
              box-shadow: 0 0 15px #8BC34A;
            }
            100% { 
              border-color: #4CAF50;
              box-shadow: 0 0 5px #4CAF50;
            }
          }
        `;
          document.head.appendChild(style);

          // Create and position hint div under the button with yellow styling
          const hintDiv = document.createElement('div');
          hintDiv.style.cssText = `
          position: absolute;
          top: ${
            (googleButton as HTMLElement).offsetTop +
            (googleButton as HTMLElement).offsetHeight +
            10
          }px;
          left: ${(googleButton as HTMLElement).offsetLeft}px;
          width: ${(googleButton as HTMLElement).offsetWidth}px;
          background-color: #FFF9C4;
          padding: 12px;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          z-index: 9999;
          font-family: Arial, sans-serif;
          font-weight: bold;
          font-size: 14px;
          color: #FF9800;
          text-align: center;
          animation: hintPulse 1s infinite;
        `;
          hintDiv.textContent = 'Please use Google login';

          // Add hint pulse animation
          const hintStyle = document.createElement('style');
          hintStyle.textContent = `
          @keyframes hintPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `;
          document.head.appendChild(hintStyle);

          document.body.appendChild(hintDiv);
        } else {
          console.log('Google sign-in button not found');
        }
      });
    }

    // Function to check if we're on the team page
    const isOnTeamPage = async () => {
      const currentUrl = await page.url();
      const urlFromEvaluate = await page.evaluate(() => window.location.href);
      console.log('Checking URLs:', { currentUrl, urlFromEvaluate });
      return currentUrl.includes('/team') || urlFromEvaluate.includes('/team');
    };

    // Wait for up to 60 seconds for the team page
    const maxWaitTime = 120000; // 120 seconds
    const startTime = Date.now();
    let isTeamPage = false;

    while (Date.now() - startTime < maxWaitTime) {
      isTeamPage = await isOnTeamPage();
      if (isTeamPage) {
        console.log('Found team page!');
        break;
      }
      console.log('Waiting for team page...');

      await new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });
    }

    if (!isTeamPage) {
      console.log('Timeout waiting for team page');
      return false;
    }

    // Now we're on the team page, navigate to API keys creation
    const finalUrl = await page.url();
    console.log('Navigating to API keys creation page');
    const apiKeysUrl = `${finalUrl}/api-keys/create`;
    await page.goto(apiKeysUrl, { waitUntil: 'networkidle0' });

    // Wait for the input field to be present and highlight it
    await page.waitForSelector('input[data-testid="name"]');
    await page.evaluate(() => {
      const input = document.querySelector(
        'input[data-testid="name"]'
      ) as HTMLElement;
      if (input) {
        // Add enhanced flashing border animation to the input
        input.style.cssText = `
        border: 3px solid #4CAF50 !important;
        animation: enhancedFlash 0.5s infinite !important;
        position: relative !important;
      `;

        // Add enhanced flash animation
        const style = document.createElement('style');
        style.textContent = `
        @keyframes enhancedFlash {
          0% { 
            border-color: #4CAF50;
            box-shadow: 0 0 5px #4CAF50;
          }
          50% { 
            border-color: #8BC34A;
            box-shadow: 0 0 15px #8BC34A;
          }
          100% { 
            border-color: #4CAF50;
            box-shadow: 0 0 5px #4CAF50;
          }
        }
      `;
        document.head.appendChild(style);

        // Create and position hint div above the input
        const hintDiv = document.createElement('div');
        hintDiv.style.cssText = `
        position: absolute;
        bottom: ${input.offsetHeight + 10}px;
        left: ${input.offsetLeft}px;
        width: ${input.offsetWidth}px;
        background-color: #FFF9C4;
        padding: 12px;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 9999;
        font-family: Arial, sans-serif;
        font-weight: bold;
        font-size: 14px;
        color: #FF9800;
        text-align: center;
        animation: hintPulse 1s infinite;
      `;
        hintDiv.textContent = 'For example: Prometheus';

        // Add hint pulse animation
        const hintStyle = document.createElement('style');
        hintStyle.textContent = `
        @keyframes hintPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `;
        document.head.appendChild(hintStyle);

        input.parentElement?.appendChild(hintDiv);
      }
    });

    // Wait for the API key to appear after clicking save
    const apiKey = await page.waitForFunction(
      () => {
        const input = document.querySelector(
          'input[type="text"][readonly]'
        ) as HTMLInputElement;
        return input?.value?.startsWith('xai-') ? input.value : null;
      },
      { timeout: 120000 }
    ); // Wait up to 120 seconds for the API key

    if (!apiKey) {
      console.log('Failed to get API key');
      return false;
    }

    const apiKeyValue = await apiKey.jsonValue();
    console.log('Successfully retrieved API key');

    const errorMessages: string[] = [];
    let postSuccess = false;
    // Store Grok API key
    try {
      const response = await axios.post(
        'http://localhost:30017/api/task-variables',
        {
          label: 'GROK_API_KEY',
          value: apiKeyValue,
        }
      );
      postSuccess = response.data.success;
      if (!postSuccess) {
        errorMessages.push(response.data.message || 'Failed to save API key');
      }
    } catch (error: any) {
      postSuccess = false;
      const errorMsg = error.response?.data?.message || error.message;
      errorMessages.push(errorMsg);
    }

    // Show appropriate alert based on results
    await page.evaluate(
      (success: boolean, error: string) => {
        window.flowInProgress = false; // Reset the flag
        if (success) {
          alert(
            '✅ Your Grok API key has been successfully saved!\nYou can now close this tab and return to the main page.'
          );
        } else if (error.includes('already exists')) {
          alert(
            "⚠️ Your Grok API key was saved locally but couldn't be updated in task variables because it already exists.\nYou can safely continue with the existing credentials."
          );
        } else {
          alert(
            `⚠️ There was an issue saving your Grok API key:\n\n${error}\n\nPlease try again.`
          );
        }
      },
      postSuccess,
      errorMessages.join('\n')
    );

    // Only close the page if it's still open
    if (page.isClosed()) {
      await page.close();
    }
    return true;
  } catch (error: any) {
    console.error('Grok flow error:', error);
    console.error('Error stack:', error.stack);
    return false;
  }
}
