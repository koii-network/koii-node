export const logsMock = `
#!/usr/bin/env node
require("dotenv").config();
const prompts = require("prompts");
const kohaku = require("@_koi/kohaku");
const axios = require("axios");

// Parse cli params
const PARSE_ARGS = [
  "REDIS_IP",
  "REDIS_PORT",
  "AR_WALLET",
  "NODE_MODE",
  "STAKE",
  "SERVICE_URL",
  "TRUSTED_SERVICE_URL",
  "SERVER_PORT",
  "TASKS",
  "RESTORE_KOHAKU"
];
let yargs = require("yargs");
for (const arg of PARSE_ARGS) yargs = yargs.option(arg, { type: "string" });
const argv = yargs.help().argv;
for (const arg of PARSE_ARGS)
  if (argv[arg] !== undefined) process.env[arg] = argv[arg];

const { tools, arweave, Namespace } = require("./src/helpers");
const { verifyStake, setupWebServer, runPeriodic } = require("./src/service");

export const IPFS_GATEWAY_URL = 'https://ipfs.io/ipfs';
`;
