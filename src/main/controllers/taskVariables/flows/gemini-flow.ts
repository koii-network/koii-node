import axios from 'axios';
import { Browser, Page } from 'puppeteer';

declare global {
  interface Window {
    flowInProgress: boolean;
  }
}

export async function handleGeminiFlow(browser: Browser) {
  let geminiPage: Page | undefined;
  let postSuccess = true;
  const errorMessages: string[] = [];

  try {
    console.log('Creating new page for Gemini flow...');
    // Create new page for Gemini flow
    geminiPage = await browser.newPage();
    console.log('New page created successfully');

    // Add close listener to reset flag
    geminiPage.on('close', async () => {
      console.log('Gemini page closed, resetting flow flag...');
      try {
        const pages = await browser.pages();
        const landingPage = pages[0];
        await landingPage.evaluate(() => {
          window.flowInProgress = false;
        });
        console.log('Flow flag reset successfully');
      } catch (error) {
        console.log('Could not reset flow flag on page close:', error);
      }
    });

    console.log('Setting viewport...');
    // Set viewport size
    await geminiPage.setViewport({
      width: 1700,
      height: 992,
    });
    console.log('Viewport set successfully');

    console.log('Navigating to Gemini API key page...');
    // Navigate to Gemini API key page
    await geminiPage.goto('https://aistudio.google.com/apikey', {
      waitUntil: 'networkidle0',
      timeout: 600000, // 10 minutes
    });
    console.log('Navigation to Gemini API key page successful');

    // Wait for and click the Get API key button
    await geminiPage.waitForSelector('button.warm-welcome-button', {
      timeout: 600000,
    });
    await geminiPage.click('button.warm-welcome-button');
    console.log('Clicked Get API key button');

    // Short wait
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });

    // Wait for and click the Create API key button
    await geminiPage.waitForSelector('button.create-api-key-button', {
      timeout: 600000,
    });
    await geminiPage.click('button.create-api-key-button');
    console.log('Clicked Create API key button');

    // Check if project selection is needed
    const projectSelectionNeeded = await geminiPage.evaluate(() => {
      const projectPrompt = document.querySelector('p.gmat-body-medium');
      if (projectPrompt) {
        alert(
          'Please select any Google Cloud project from the list and click "Create API key" to continue.'
        );
        return true;
      }
      return false;
    });

    if (projectSelectionNeeded) {
      console.log('Waiting for user to select a project...');
      // Wait for the API key to appear after project selection
      await geminiPage.waitForSelector('div.apikey-text', { timeout: 600000 }); // 10 minutes timeout
    } else {
      // Wait for the API key input field to be visible
      await geminiPage.waitForSelector('div.apikey-text', { timeout: 600000 });
    }

    // Get and store the API key
    const apiKey = await geminiPage.evaluate(() => {
      const keyElement = document.querySelector('div.apikey-text');
      return keyElement ? keyElement.textContent : null;
    });

    if (apiKey && apiKey.startsWith('AI')) {
      console.log('Successfully retrieved API key');

      // Store Gemini API key
      try {
        const response = await axios.post(
          'http://localhost:30017/api/task-variables',
          {
            label: 'GEMINI_API_KEY',
            value: apiKey,
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
      await geminiPage.evaluate(
        (success: boolean, error: string) => {
          window.flowInProgress = false; // Reset the flag
          if (success) {
            alert(
              '✅ Your Gemini API key has been successfully saved!\nYou can now close this tab and return to the main page.'
            );
          } else if (error.includes('already exists')) {
            alert(
              "⚠️ Your Gemini API key was saved locally but couldn't be updated in task variables because it already exists.\nYou can safely continue with the existing credentials."
            );
          } else {
            alert(
              `⚠️ There was an issue saving your Gemini API key:\n\n${error}\n\nPlease try again.`
            );
          }
        },
        postSuccess,
        errorMessages.join('\n')
      );

      // Only close the page if it's still open
      if (!geminiPage.isClosed()) {
        await geminiPage.close();
      }
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('Gemini flow error:', error);
    console.error('Error stack:', error.stack);
    // Reset flow flag on error
    try {
      const pages = await browser.pages();
      const landingPage = pages[0];
      await landingPage.evaluate(() => {
        window.flowInProgress = false;
      });
      console.log('Flow flag reset after error');
    } catch (evalError) {
      console.error('Error resetting flow flag:', evalError);
    }
    return false;
  } finally {
    // Only close the Gemini page in finally if it exists and hasn't been closed
    if (geminiPage && !geminiPage.isClosed()) {
      try {
        await geminiPage.close();
      } catch (error) {
        console.log('Page already closed');
      }
    }
    // Reset flow flag in case of manual close or any other scenario
    try {
      const pages = await browser.pages();
      const landingPage = pages[0];
      await landingPage.evaluate(() => {
        window.flowInProgress = false;
      });
    } catch (error) {
      console.log('Could not reset flow flag:', error);
    }
  }
}
