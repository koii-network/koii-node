import crypto from 'crypto';
import path from 'path';

import watch from 'node-watch';

import fs from 'fs-extra';

interface ExecutableMonitorOptions {
  folderPath: string;
  sendAlert: (executable: string, file: string) => void;
}

class ExecutableMonitor {
  private folderPath: string;

  private sendAlert: (executable: string, file: string) => void;

  private hashes: Map<string, string>;

  constructor(options: ExecutableMonitorOptions) {
    this.folderPath = options.folderPath;
    this.sendAlert = options.sendAlert;
    this.hashes = new Map();
  }

  public async start(): Promise<void> {
    try {
      await fs.ensureDir(this.folderPath);
      console.log(`Monitoring folder: ${this.folderPath}`);

      watch(
        this.folderPath,
        { recursive: true, filter: /\.js$/ },
        async (evt, name) => {
          if (evt === 'update') {
            try {
              await this.handleFileChange(name);
            } catch (error) {
              console.error('Error handling file change:', error);
            }
          }
        }
      );

      console.log('Executable monitor started.');
    } catch (error) {
      console.error('Error starting executable monitor:', error);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private async calculateHash(filePath: string): Promise<string> {
    const fileData = await fs.readFile(filePath);
    const hash = crypto.createHash('sha256').update(fileData).digest('hex');
    return hash;
  }

  private async handleFileChange(filePath: string): Promise<void> {
    const fileName = path.basename(filePath);
    const oldHash = this.hashes.get(filePath);

    if (!oldHash) {
      // File is newly created, calculate the initial hash
      const initialHash = await this.calculateHash(filePath);
      this.hashes.set(filePath, initialHash);
      return;
    }

    const newHash = await this.calculateHash(filePath);

    if (oldHash !== newHash) {
      console.log(`File changed: ${filePath}`);
      this.hashes.set(filePath, newHash);
      this.sendAlert(filePath, fileName);
    }
  }
}

export default ExecutableMonitor;
