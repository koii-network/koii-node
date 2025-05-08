import fs from 'fs/promises';
import path from 'path';

import { getAppDataPath } from '../node/helpers/getAppDataPath';

interface BrandingConfig {
  appName: string;
  logo: string;
  primaryColor: string;
  onboardingTaskID: string;
}

export async function validateBrandingFolder(
  _: Event,
  folderPath: string
): Promise<boolean> {
  try {
    const configPath = path.join(folderPath, 'branding.json');
    const logoPath = path.join(folderPath, 'logo.svg');

    await fs.access(configPath);
    await fs.access(logoPath);

    const configData = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configData) as BrandingConfig;

    // return !!(config.appName && config.logo && config.primaryColor);

    return true;
  } catch {
    return false;
  }
}

export async function copyBrandingFolder(
  _: Event,
  sourcePath: string
): Promise<void> {
  const brandingPath = path.join(getAppDataPath(), 'branding');

  try {
    await fs.mkdir(brandingPath, { recursive: true });

    const files = await fs.readdir(sourcePath);

    for (const file of files) {
      const src = path.join(sourcePath, file);
      const dest = path.join(brandingPath, file);
      await fs.copyFile(src, dest);
    }
  } catch (error) {
    console.error('Failed to copy branding folder:', error);
    throw error;
  }
}

export async function getBrandingConfig(
  _: Event
): Promise<BrandingConfig | null> {
  try {
    const configPath = path.join(getAppDataPath(), 'branding', 'branding.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configData) as BrandingConfig;
  } catch {
    return null;
  }
}

export async function getBrandLogo(_: Event): Promise<string | null> {
  const brandingPath = path.join(getAppDataPath(), 'branding', 'logo.svg');

  try {
    await fs.access(brandingPath);
    const svgContent = await fs.readFile(brandingPath, 'utf-8');
    return svgContent;
  } catch {
    return null;
  }
}
