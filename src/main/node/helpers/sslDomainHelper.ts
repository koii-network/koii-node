import fs from 'fs';
import path from 'path';

import acme from 'acme-client';

import { getAppDataPath } from './getAppDataPath/getAppDataPath';
// Specify the log file path
const logFilePath = path.join(getAppDataPath(), 'logs', 'uPnP.log');

// Custom log function to write to the log file
function log(...args: any[]) {
  const message = args.join(' ');
  fs.appendFile(logFilePath, `${message}\n`, (err: any) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
}

async function challengeCreateFn(
  authz: acme.Authorization,
  challenge: any,
  keyAuthorization: string
) {
  log('Triggered challengeCreateFn()');
  if (challenge.type === 'http-01') {
    const fileContents = keyAuthorization;
    const folderPath = `${getAppDataPath()}/PUBLIC_STATIC_IMMUTABLE/.well-known/acme-challenge/`;

    const filePath = `${folderPath}${challenge.token}`;
    log(
      `Creating challenge response for ${authz.identifier.value} at path: ${filePath}`
    );
    log(`Would write "${fileContents}" to path "${filePath}"`);
    if (!fs.existsSync(folderPath))
      fs.mkdirSync(folderPath, { recursive: true });

    // removing previous authentications..
    fs.readdirSync(folderPath).forEach((file) => {
      const filePath = `${folderPath}/${file}`;
      fs.unlinkSync(filePath);
    });

    fs.writeFileSync(filePath, fileContents);
  } else if (challenge.type === 'dns-01') {
    const dnsRecord = `_acme-challenge.${authz.identifier.value}`;
    const recordValue = keyAuthorization;
    log(`Creating TXT record for ${authz.identifier.value}: ${dnsRecord}`);
    log(`Would create TXT record "${dnsRecord}" with value "${recordValue}"`);
  }
}

async function challengeRemoveFn(
  authz: acme.Authorization,
  challenge: any,
  keyAuthorization: string
) {
  log('Triggered challengeRemoveFn()');

  if (challenge.type === 'http-01') {
    const filePath = `${getAppDataPath()}/PUBLIC_STATIC_IMMUTABLE/.well-known/acme-challenge/${
      challenge.token
    }`;
    log(
      `Removing challenge response for ${authz.identifier.value} at path: ${filePath}`
    );
    log(`Would remove file on path "${filePath}"`);
  } else if (challenge.type === 'dns-01') {
    const dnsRecord = `_acme-challenge.${authz.identifier.value}`;
    const recordValue = keyAuthorization;
    log(`Removing TXT record for ${authz.identifier.value}: ${dnsRecord}`);
    log(`Would remove TXT record "${dnsRecord}" with value "${recordValue}"`);
  }
}

async function getCert(domain: string) {
  const client = new acme.Client({
    directoryUrl: acme.directory.letsencrypt.production,
    accountKey: await acme.crypto.createPrivateKey(),
  });

  // eslint-disable-next-line @cspell/spellchecker
  // if (!domain.endsWith('.koiidns.com')) {
  //   return { csr: null, key: null, cert: null };
  // }
  const [key, csr] = await acme.crypto.createCsr({
    commonName: domain,
  });
  const subDomain = domain.split('.')[0];
  const cert = await client.auto({
    csr,
    // eslint-disable-next-line @cspell/spellchecker
    email: `${subDomain}@koiidnsdummy.com`,
    termsOfServiceAgreed: true,
    challengeCreateFn,
    challengeRemoveFn,
    skipChallengeVerification: true,
  });

  log(`CSR:\n${csr.toString()}`);
  log(`Private key:\n${key.toString()}`);
  log(`Certificate:\n${cert.toString()}`);
  const folderPath = `${getAppDataPath()}/certs/`;
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
  else {
    fs.readdirSync(folderPath).forEach((file) => {
      const filePath = `${folderPath}/${file}`;
      fs.unlinkSync(filePath);
    });
  }
  fs.writeFileSync(`${getAppDataPath()}/certs/cert`, cert);
  fs.writeFileSync(`${getAppDataPath()}/certs/key`, key.toString());
  fs.writeFileSync(`${getAppDataPath()}/certs/csr`, csr.toString());
  return { csr, key, cert };
}

export default getCert;
