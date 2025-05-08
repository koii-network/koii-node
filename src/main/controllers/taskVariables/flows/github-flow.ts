import axios from 'axios';
import { Browser, Page } from 'puppeteer';

declare global {
  interface Window {
    flowInProgress: boolean;
  }
}

export async function handleGitHubFlow(browser: Browser) {
  let githubPage: Page | undefined;
  let postSuccess = true;
  const errorMessages: string[] = [];

  try {
    console.log('Creating new page for GitHub flow...');
    // Create new page for GitHub flow
    githubPage = await browser.newPage();
    console.log('New page created successfully');

    // Add close listener to reset flag
    githubPage.on('close', async () => {
      console.log('GitHub page closed, resetting flow flag...');
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
    await githubPage.setViewport({
      width: 1700,
      height: 992,
    });
    console.log('Viewport set successfully');

    console.log('Navigating to GitHub login...');
    // Navigate to GitHub login
    await githubPage.goto('https://github.com/login', {
      waitUntil: 'networkidle0',
      timeout: 600000, // 10 minutes
    });
    console.log('Navigation to GitHub login successful');

    // Function to check if we're on the wrong page and need to restart
    const checkAndRestartFlow = async () => {
      if (!githubPage) return false;
      const currentUrl = githubPage.url();
      const validUrls = [
        'https://github.com/login',
        'https://github.com/',
        'https://github.com/dashboard',
        'https://github.com/settings/tokens/new',
        'https://github.com/settings/tokens',
      ];

      if (!validUrls.some((url) => currentUrl.startsWith(url))) {
        await githubPage.evaluate(() => {
          alert(
            "⚠️ Oops! You've navigated to the wrong page. Redirecting back to login..."
          );
        });

        // Wait a moment for the warning to be seen
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, 2000);
        });

        // Navigate back to login
        await githubPage.goto('https://github.com/login', {
          waitUntil: 'networkidle0',
          timeout: 600000,
        });
        return true; // Flow needs restart
      }
      return false; // Flow can continue
    };

    // Add navigation listener to check for wrong paths
    if (githubPage) {
      githubPage.on('framenavigated', async (frame) => {
        if (frame === githubPage?.mainFrame()) {
          await checkAndRestartFlow();
        }
      });
    }

    // Add warning message and highlight login field
    await githubPage.evaluate(() => {
      const loginField = document.querySelector('#login_field');
      const createAccountLink = document.querySelector('a[href="/signup"]');

      if (loginField && loginField.parentNode) {
        // Create warning message
        const warningDiv = document.createElement('div') as HTMLDivElement;
        warningDiv.textContent =
          "⚠️ Please use your spare GitHub account. If you don't have one, click the highlighted 'Create an account' button below.";
        warningDiv.style.cssText = `
          color: #b59f00;
          background: #fffbe6;
          border: 1px solid #fff5c1;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 15px;
          padding: 8px 12px;
          text-align: center;
          animation: warningPulse 2s infinite;
        `;

        // Add animation style
        const style = document.createElement('style');
        style.textContent = `
          @keyframes warningPulse {
            0% { opacity: 0.8; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.02); }
            100% { opacity: 0.8; transform: scale(1); }
          }
        `;
        document.head.appendChild(style);

        // Insert warning before login field
        loginField.parentNode.insertBefore(warningDiv, loginField);

        // Highlight login field
        (loginField as HTMLElement).style.cssText = `
          border: 2px solid #e3b341 !important;
          box-shadow: 0 0 5px rgba(227, 179, 65, 0.3);
        `;

        // Highlight the Create Account link if it exists
        if (createAccountLink) {
          (createAccountLink as HTMLElement).style.cssText = `
            background: #2ea44f !important;
            color: white !important;
            border-radius: 6px;
            padding: 8px 16px !important;
            animation: pulseBorder 2s infinite;
          `;

          // Add target="_blank" to open in new tab
          createAccountLink.setAttribute('target', '_blank');

          // Add note about returning
          const returnNote = document.createElement('div') as HTMLDivElement;
          returnNote.textContent =
            'After creating your account, please return to this tab to continue.';
          returnNote.style.cssText = `
            color: #1a7f37;
            font-size: 12px;
            margin-top: 8px;
          `;
          if (createAccountLink.parentNode) {
            createAccountLink.parentNode.appendChild(returnNote);
          }

          // Add pulse animation
          const style = document.createElement('style');
          style.textContent = `
            @keyframes pulseBorder {
              0% { box-shadow: 0 0 5px rgba(46, 164, 79, 0.4); }
              50% { box-shadow: 0 0 15px rgba(46, 164, 79, 0.6); }
              100% { box-shadow: 0 0 5px rgba(46, 164, 79, 0.4); }
            }
          `;
          document.head.appendChild(style);
        }
      }
    });

    // Show login alert with create account option
    await githubPage.evaluate(() => {
      alert(
        'Please login to GitHub or create a new account (opens in new tab) to continue'
      );
    });

    // Modified navigation waiting logic
    let isLoggedIn = false;
    while (!isLoggedIn) {
      try {
        await githubPage
          .waitForNavigation({
            waitUntil: 'networkidle0',
            timeout: 60000, // 1 minute
          })
          .catch(() => {
            // Ignore timeout errors
          });

        // Check if we need to restart the flow
        const needsRestart = await checkAndRestartFlow();
        if (needsRestart) {
          isLoggedIn = false; // Reset the flag to keep the loop going
        } else {
          const currentUrl = githubPage.url();
          if (
            currentUrl === 'https://github.com/' ||
            currentUrl === 'https://github.com/dashboard'
          ) {
            isLoggedIn = true; // User is logged in, continue with the flow
          }
        }
      } catch (error) {
        console.log('Navigation error:', error);
      }

      // Small delay between checks
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
    }

    // Now check if login was successful
    const currentUrl = githubPage.url();
    if (
      currentUrl === 'https://github.com/' ||
      currentUrl === 'https://github.com/dashboard'
    ) {
      // Get and store GitHub username
      const username = await githubPage.evaluate(() => {
        const metaElement = document.querySelector('meta[name="user-login"]');
        return metaElement ? metaElement.getAttribute('content') : null;
      });

      if (username) {
        console.log('Successfully retrieved username:', username);

        // Store GitHub username
        try {
          const usernameResponse = await axios.post(
            'http://localhost:30017/api/task-variables',
            {
              label: 'GITHUB_USERNAME',
              value: username,
            }
          );
          console.log('Username response:', usernameResponse.data);
          if (!usernameResponse.data.success) {
            postSuccess = false;
            errorMessages.push(
              `GitHub Username Error: ${
                usernameResponse.data.message || 'Failed to save username'
              }`
            );
          }
        } catch (error: any) {
          postSuccess = false;
          const errorMsg = error.response?.data?.message || error.message;
          errorMessages.push(`GitHub Username Error: ${errorMsg}`);
        }
      }

      await githubPage.evaluate(() => {
        alert(
          'You are now successfully logged in.\nRedirecting to token creation page in 3 seconds...'
        );
      });

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 3000);
      });

      // Navigate to tokens page
      await githubPage.goto('https://github.com/settings/tokens/new', {
        waitUntil: 'networkidle0',
        timeout: 600000, // 10 minutes
      });

      // Add hints and highlights for token creation
      await githubPage.evaluate(() => {
        const inputElement = document.querySelector(
          'input[name="oauth_access[description]"]'
        );
        if (inputElement) {
          // Style the input element
          (inputElement as HTMLElement).style.cssText = `
            border: 2px solid #2ea44f !important;
            box-shadow: 0 0 5px rgba(46, 164, 79, 0.4);
            animation: pulse 2s infinite;
          `;

          // Create hint element
          const hintElement = document.createElement('span');
          hintElement.textContent =
            'Please enter a name for your token, for example: 247 builder';
          hintElement.style.cssText = `
            margin-left: 10px;
            color: #2ea44f;
            font-size: 12px;
            font-style: italic;
            display: inline-block;
            vertical-align: middle;
            animation: pulse 2s infinite;
          `;

          // Insert hint after the input
          if (inputElement.parentNode) {
            inputElement.parentNode.insertBefore(
              hintElement,
              inputElement.nextSibling
            );
          }
        }

        // Highlight the repo scope checkbox
        const checkbox = document.querySelector('input[value="repo"]');
        if (checkbox) {
          const checkboxContainer =
            checkbox.closest('li') || checkbox.parentElement;
          if (checkboxContainer) {
            (checkboxContainer as HTMLElement).style.cssText = `
              background: rgba(46, 164, 79, 0.1);
              border-radius: 6px;
              padding: 8px;
              border: 2px solid #2ea44f;
              margin: 5px 0;
              animation: pulse 2s infinite;
            `;

            const checkboxHint = document.createElement('div');
            checkboxHint.textContent =
              'Please check this box and scroll down to the "Generate token" button';
            checkboxHint.style.cssText = `
              color: #2ea44f;
              font-size: 12px;
              font-style: italic;
              margin-top: 5px;
              animation: pulse 2s infinite;
            `;

            checkboxContainer.appendChild(checkboxHint);
          }
        }

        // Add pulse animation
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }
        `;
        document.head.appendChild(styleSheet);
      });

      // Wait for navigation after clicking generate token
      await githubPage.waitForNavigation({
        waitUntil: 'networkidle0',
        timeout: 600000, // 10 minutes
      });

      // Check if we're on the tokens page and save token
      if (githubPage.url() === 'https://github.com/settings/tokens') {
        console.log('Successfully generated token');

        const token = await githubPage.evaluate(() => {
          const tokenElement = document.querySelector('#new-oauth-token');
          return tokenElement ? tokenElement.textContent : null;
        });

        if (token) {
          console.log('Successfully retrieved token');

          // Store GitHub token
          try {
            const tokenResponse = await axios.post(
              'http://localhost:30017/api/task-variables',
              {
                label: 'GITHUB_TOKEN',
                value: token,
              }
            );
            if (!tokenResponse.data.success) {
              postSuccess = false;
              errorMessages.push(
                `GitHub Token Error: ${
                  tokenResponse.data.message || 'Failed to save token'
                }`
              );
            }
          } catch (error: any) {
            postSuccess = false;
            const errorMsg = error.response?.data?.message || error.message;
            errorMessages.push(`GitHub Token Error: ${errorMsg}`);
          }

          // Show appropriate alert based on results
          await githubPage.evaluate(
            (success, errors) => {
              window.flowInProgress = false;
              if (success) {
                alert(
                  '✅ Your GitHub information has been successfully saved!\nYou can now close this tab and return to the main page.'
                );
              } else if (errors.some((err) => err.includes('already exists'))) {
                alert(
                  "⚠️ Your GitHub information was saved locally but couldn't be updated in task variables because they already exist.\nYou can safely continue with the existing credentials."
                );
              } else {
                alert(
                  `⚠️ There were some issues:\n\n${errors.join(
                    '\n\n'
                  )}\n\n It probably means the task extension is already set.`
                );
              }
            },
            postSuccess,
            errorMessages
          );

          // Only close the GitHub page
          if (!githubPage.isClosed()) {
            await githubPage.close();
          }
          return true;
        }
      }
    }
    return false;
  } catch (error: any) {
    // Type error as any since we need to access error.response
    console.error('GitHub flow error:', error);
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
    // Only close the GitHub page in finally if it exists and hasn't been closed
    if (githubPage && !githubPage.isClosed()) {
      try {
        await githubPage.close();
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
