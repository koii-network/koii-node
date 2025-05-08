import { exec } from 'child_process';
import { promisify } from 'util';

import sudo from 'sudo-prompt';

const execPromise = promisify(exec);

interface CommandError extends Error {
  code?: number;
  stdout?: string | Buffer;
  stderr?: string | Buffer;
}

async function runCommand(
  command: string,
  isSudo: boolean
): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
}> {
  if (isSudo) {
    return new Promise((resolve, reject) => {
      sudo.exec(command, { name: 'Electron' }, (error, stdout, stderr) => {
        const exitCode = (error as CommandError)?.code ?? 0;
        const outStr = bufferToString(stdout);
        const errStr = bufferToString(stderr);
        if (error && exitCode !== 0) {
          reject(error);
        } else {
          resolve({ stdout: outStr, stderr: errStr, exitCode });
        }
      });
    });
  } else {
    try {
      const { stdout, stderr } = await execPromise(command);
      return {
        stdout: bufferToString(stdout),
        stderr: bufferToString(stderr),
        exitCode: 0,
      };
    } catch (error) {
      const execError = error as CommandError;
      const exitCode = execError.code ?? 1;

      if (exitCode === 0) {
        const stdout = bufferToString(execError.stdout);
        const stderr = bufferToString(execError.stderr);
        return { stdout, stderr, exitCode };
      } else {
        throw error;
      }
    }
  }
}

export async function execCommandAsync(
  command: string,
  context: string,
  isSudo = false
): Promise<{ stdout: string; stderr: string }> {
  try {
    const { stdout, stderr, exitCode } = await runCommand(command, isSudo);

    // Homebrew (and possibly other applications) can print on stderr even when the command is successful
    // so we need to check the exit code
    const errorCanBeIgnored =
      /is already installed|already exists/.test(stderr) || exitCode === 0;
    if (!errorCanBeIgnored) {
      console.error(`${context}: ${stderr}`);
      throw new Error(`${context}: ${stderr}`);
    } else if (stderr) {
      console.warn(`${context}: ${stderr}`);
    } else if (stdout) {
      console.log(`${context} output: ${stdout}`);
    }

    return { stdout, stderr };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : error;
    console.error(`${context}: ${errorMsg}`);
    throw new Error(`${context}: ${errorMsg}`);
  }
}

function bufferToString(data: string | Buffer | undefined) {
  if (!data) return '';
  return Buffer.isBuffer(data) ? data.toString() : data;
}
