import { userInfo } from 'node:os';
import process from 'node:process';

import execa from 'execa';

const args = [
  '-ilc',
  'echo -n "_SHELL_ENV_DELIMITER_"; env; echo -n "_SHELL_ENV_DELIMITER_"; exit',
];

const env = {
  // Disables Oh My Zsh auto-update thing that can block the process.
  DISABLE_AUTO_UPDATE: 'true',
};

function parseEnv(env: string) {
  const [, envPart] = env.split('_SHELL_ENV_DELIMITER_');
  const returnValue: NodeJS.ProcessEnv = {};

  for (const line of stripAnsi(envPart)
    .split('\n')
    .filter((line) => Boolean(line))) {
    const [key, ...values] = line.split('=');
    returnValue[key] = values.join('=');
  }

  return returnValue;
}

function shellEnvSync(shell?: string) {
  let defaultShell = '';
  try {
    const { shell: userShell } = userInfo();
    if (userShell) {
      defaultShell = userShell;
    }
  } catch {
    defaultShell = '/bin/zsh';
  }

  try {
    const { stdout } = execa.sync(shell || defaultShell, args, { env });
    return parseEnv(stdout);
  } catch (error) {
    if (shell) {
      throw error;
    } else {
      return process.env;
    }
  }
}

function stripAnsi(str: string): string {
  const pattern =
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?(?:\\u0007|\\u001B\\u005C|\\u009C))|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))';

  const regex = new RegExp(pattern, 'g');
  if (typeof str !== 'string') {
    throw new TypeError(`Expected a \`string\`, got \`${typeof str}\``);
  }

  // Even though the regex is global, we don't need to reset the `.lastIndex`
  // because unlike `.exec()` and `.test()`, `.replace()` does it automatically
  // and doing it manually has a performance penalty.
  return str.replace(regex, '');
}

export function fixPath() {
  const { PATH } = shellEnvSync();
  process.env.PATH =
    PATH ||
    [
      './node_modules/.bin',
      '/.nodebrew/current/bin',
      '/usr/local/bin',
      process.env.PATH,
    ].join(':');
}
