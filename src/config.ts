/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */

import { promises as fs } from 'fs';
import { assert } from '@sindresorhus/is';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

const config = {
  instanceId: uuidv4(),
  providerUrl: '',
  app: {
    env: '',
    name: '',
    version: '',
    roles: [] as string[],
  },
  webApp: {
    protocol: '',
    host: '',
  },
  http: {
    port: '',
  },
  missingVersionsManager: {
    batchSize: 10,
    syncFrom: 'beginning' as 'beginning' | 'end',
  },
};

export const loadConfig = async (): Promise<typeof config> => {
  const pkg = JSON.parse(await fs.readFile('./package.json', 'utf-8'));
  const ENV = process.env;

  let env = ENV.ENVIRONMENT;

  if (!env || env === 'local') {
    dotenv.config();
    env = process.env.ENVIRONMENT;
  }

  assert.string(ENV.ROLES);
  assert.string(ENV.PROVIDER_URL);

  Object.assign(config, {
    providerUrl: ENV.PROVIDER_URL,
    app: {
      env: ENV.ENVIRONMENT,
      name: pkg.name,
      version: pkg.version,
      roles: ENV.ROLES.split(','),
    },
    http: {
      port: ENV.PORT,
    },
    missingVersionsManager: {
      batchSize: process.env.MISSING_VERSIONS_MANAGER_BATCH_SIZE ? parseInt(process.env.MISSING_VERSIONS_MANAGER_BATCH_SIZE, 10) : 10,
      syncFrom: process.env.MISSING_VERSIONS_MANAGER_SYNC_FROM ? process.env.MISSING_VERSIONS_MANAGER_SYNC_FROM : 'end',
    }
  });

  return config;
};

export default config;
