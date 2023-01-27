import { promises as fs } from 'fs';
import { assert } from '@sindresorhus/is';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

type Role = 'api' | 'blockchain-watcher' | 'jobs-runner' | 'vitals-watcher';

const config = {
  instanceId: uuidv4(),
  providerUrl: '',
  vitalsUrl: '',
  maxmind: {
    dbPath: '',
  },
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
  s3: {
    accessKeyId: '',
    secretAccessKey: '',
    endpoint: '',
    // region: '',
    // s3ForcePathStyle: true,
    // signatureVersion: '',
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

  Object.assign(config, {
    providerUrl: ENV.PROVIDER_URL,
    vitalsUrl: ENV.VITALS_URL,
    maxmind: {
      dbPath: ENV.MAXMIND_DB_PATH,
    },
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
    s3: {
      accessKeyId: ENV.S3_ACCESS_KEY_ID,
      secretAccessKey: ENV.S3_SECRET_ACCESS_KEY,
      endpoint: ENV.S3_ENDPOINT,
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    },
  });

  return config;
};

export default config;
