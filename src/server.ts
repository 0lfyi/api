import nodeSchedule from 'node-schedule';
import Server from './modules/server/index.js';
import config from './config.js';
import logger from './logger.js';
import BlockchainWatcher from './modules/blockchain-watcher/BlockchainWatcher.js';
import BlockProcessor from './modules/block-processor/BlockProcessor.js';
import reportMetrics from './jobs/report-metrics/index.js';

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

  if (config.app.roles.includes('block-processor')) {
    await BlockProcessor.create();
  }

  if (config.app.roles.includes('jobs-runner')) {
    schedule('Report Metrics', `* * * * * *`, reportMetrics);
  }
};
