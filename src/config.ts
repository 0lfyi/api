import { promises as fs } from 'fs';
import { assert } from '@sindresorhus/is';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

type Role = 'api' | 'blockchain-watcher' | 'jobs-runner' | 'vitals-watcher';

const config = {
  instanceId: uuidv4(),
  providerUrl: '',
  vitalsUrl: '',
  app: {
    env: '',
    name: '',
    version: '',
    roles: [] as Role[],
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
  influxdb: {
    org: '',
    bucket: '',
    host: '',
    token: '',
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
  assert.string(ENV.VITALS_URL);

  Object.assign(config, {
    providerUrl: ENV.PROVIDER_URL,
    vitalsUrl: ENV.VITALS_URL,
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
      batchSize: process.env.MISSING_VERSIONS_MANAGER_BATCH_SIZE
        ? parseInt(process.env.MISSING_VERSIONS_MANAGER_BATCH_SIZE, 10)
        : 10,
      syncFrom: process.env.MISSING_VERSIONS_MANAGER_SYNC_FROM
        ? process.env.MISSING_VERSIONS_MANAGER_SYNC_FROM
        : 'end',
    },
    influxdb: {
      org: ENV.INFLUXDB_ORG,
      bucket: ENV.INFLUXDB_BUCKET,
      host: ENV.INFLUXDB_HOST,
      token: ENV.INFLUXDB_TOKEN,
    },
  });

  return config;
};

export default config;
