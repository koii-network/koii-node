import os from 'os';

import { Request, Response } from 'express';
import puppeteer, { Browser, Page } from 'puppeteer';
import PCR from 'puppeteer-chromium-resolver';

import { handleClaudeFlow } from './flows/claude-flow';
import { handleGeminiFlow } from './flows/gemini-flow';
import { handleGitHubFlow } from './flows/github-flow';

let isCleaningUp = false;

function getOptions() {
  let revision;

  if (os.platform() === 'darwin') {
    if (os.arch() === 'arm64') {
      // Apple Silicon (M1/M2) Mac
      revision = '1398047'; // Replace with the correct revision number for Mac_Arm
    } else {
      // Intel-based Mac
      revision = '1398623'; // Replace with the correct revision number for Mac
    }
  } else {
    switch (os.platform()) {
      case 'linux':
        revision = '1398043';
        break;
      case 'win32': // Windows
        revision = '1398050';
        break;
      default:
        throw new Error('Unsupported platform');
    }
  }

  return {
    revision, // Chromium revision based on OS
    detectionPath: './.chromium-browser-snapshots', // Path to store Chromium
    download: true, // Automatically download Chromium
  };
}

async function cleanup(browser: any) {
  if (isCleaningUp) return;
  isCleaningUp = true;

  try {
    if (browser?.isConnected()) {
      const pages = await browser.pages().catch(() => []);
      await Promise.all(
        pages.map(async (page: Page) => {
          try {
            await page.close().catch((error: Error) => {
              console.warn('Failed to close page during cleanup:', error);
            });
          } catch (error: unknown) {
            console.warn('Error during page cleanup:', error);
          }
        })
      );
      await browser.close().catch((error: Error) => {
        console.warn('Failed to close browser during cleanup:', error);
      });
    }
  } catch (error: unknown) {
    console.warn('Error during browser cleanup:', error);
  }

  console.log('Cleanup complete');
  isCleaningUp = false;
}

export const handleCardClick = async (req: Request, res: Response) => {
  const { cardType } = req.params;
  let browser: Browser | undefined;

  try {
    if (cardType === 'grok') {
      return undefined;
      // console.log('Initiating Grok flow...');
      // await handleGrokFlow();
      // res.json({ success: true });
    } else {
      console.log(`Starting ${cardType} flow...`);
      // Resolve Chromium using PCR
      const options = getOptions();
      const stats = await PCR(options);
      console.log('Chromium resolved successfully');

      browser = await puppeteer.launch({
        executablePath: stats.executablePath,
        headless: false,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-gpu',
          '--disable-setuid-sandbox',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-software-rasterizer',
          '--window-size=1700,992',
          '--window-position=0,0',
          '--start-maximized',
          '--max-width=1700',
          '--max-height=992',
        ],
        defaultViewport: {
          width: 1700,
          height: 992,
        },
      });

      console.log('Browser launched successfully');

      if (cardType === 'github') {
        console.log('Initiating GitHub flow...');
        await handleGitHubFlow(browser);
        res.json({ success: true });
      } else if (cardType === 'anthropic') {
        console.log('Initiating Claude flow...');
        await handleClaudeFlow(browser);
        res.json({ success: true });
      } else if (cardType === 'gemini') {
        console.log('Initiating Gemini flow...');
        await handleGeminiFlow(browser);
        res.json({ success: true });
      } else {
        res.status(400).json({ error: 'Invalid card type' });
      }
    }
  } catch (error) {
    console.error('Error in handleCardClick:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to handle card click';
    res.status(500).json({
      error: errorMessage,
      help: 'If Chromium installation fails, please check your internet connection and try again',
    });
  } finally {
    if (browser) {
      console.log('Cleaning up browser...');
      await cleanup(browser);
    }
  }
};
