import nodeSchedule from 'node-schedule';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import Server from './modules/server/index.js';
import config from './config.js';
import logger from './logger.js';
import BlockchainWatcher from './modules/blockchain-watcher/BlockchainWatcher.js';
import reportMetrics from './jobs/report-metrics/index.js';
import VitalsWatcher from './modules/vitals-watcher/VitalsWatcher.js';
import prisma from './services/prisma.js';

const schedule = (name: string, cronRule: string, handler: () => Promise<void>) => {
  const job = nodeSchedule.scheduleJob(cronRule, () => {
    // logger.info(`Running cron task "${name}".`);

    handler()
      .then(() => {
        // logger.info(`Cron task "${name}" succeeded.`);
      })
      .catch((err) => {
        logger.error(`Cron task "${name}" failed`, err);
      });
  });
  const nextInvocation: Date | null = job.nextInvocation();
  if (!nextInvocation) {
    logger.error(`No invocation planned for "${name}" (${cronRule})`);
  } else {
    logger.info(`Scheduling task "${name}". Next invocation on ${nextInvocation.toISOString()}.`);
  }
};

export const listen = async (): Promise<void> => {
  logger.info(
    `Booting: app=${config.app.name} version=${config.app.version} pid=${process.pid} instanceId=${config.instanceId} roles=${config.app.roles}`
  );

  if (config.app.roles.includes('api')) {
    const server = await Server.create(config.http.port);
    server.listen();
  }

  if (config.app.roles.includes('blockchain-watcher')) {
    await BlockchainWatcher.create();
  }

  if (config.app.roles.includes('vitals-watcher')) {
    await VitalsWatcher.create();
  }

  if (config.app.roles.includes('jobs-runner')) {
    schedule('Report Metrics', `* * * * * *`, reportMetrics);
  }

  const { token, org, bucket } = config.influxdb;

  const client = new InfluxDB({ url: config.influxdb.host, token });

  const writeApi = client.getWriteApi(org, bucket, 'us');

  const BATCH_SIZE = 1000;
  for (let page = 0; ; ++page) {
    console.log(`page = ${page}`);
    const rows: {
      version: bigint;
      timestamp: bigint;
      gasUsed: bigint;
    }[] = await prisma.$queryRaw`
      SELECT
        "Version"."version",
        "Version"."timestamp",
        "Transaction"."gasUsed"
      FROM "Version"
      LEFT JOIN "Transaction" ON "Transaction"."version" = "Version"."version"
      WHERE
        "Transaction"."type" = 'User'
      ORDER BY "Version"."version"
      OFFSET ${page * BATCH_SIZE}
      LIMIT ${BATCH_SIZE}
    `;

    if (!rows.length) {
      break;
    }

    const points = rows.map((row) => {
      const point = new Point('user_transaction_gas_used');
      point.timestamp(Number(row.timestamp));
      point.tag('version', row.version.toString(10));
      point.uintField('value', Number(row.gasUsed));
      return point;
    });

    writeApi.writePoints(points);
  }

  await writeApi.flush();
  await writeApi.close();

  console.log('done');
};
