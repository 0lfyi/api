import nodeSchedule from 'node-schedule';
import ProgressBar from 'progress';
import _ from 'lodash';
import { spawnSync } from 'child_process';
import fs from 'fs';
import Server from './modules/server/index.js';
import config from './config.js';
import logger from './logger.js';
import BlockchainWatcher from './modules/blockchain-watcher/BlockchainWatcher.js';
import reportMetrics from './jobs/report-metrics/index.js';
import VitalsWatcher from './modules/vitals-watcher/VitalsWatcher.js';
import { weeksToDays } from 'date-fns';
import { Zstd } from "@hpcc-js/wasm";
import S3 from './services/s3.js';
import { TransactionView } from './modules/0l/types.js';

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

  // if (config.app.roles.includes('blockchain-watcher')) {
  //   await BlockchainWatcher.create();
  // }

  if (config.app.roles.includes('vitals-watcher')) {
    await VitalsWatcher.create();
  }

  if (config.app.roles.includes('jobs-runner')) {
    schedule('Report Metrics', `* * * * * *`, reportMetrics);
  }

  const VERSION_DIR = '/home/ubuntu/Projects/004_PIPELINE/out';

  const files = await fs.promises.readdir(VERSION_DIR);
  let ranges = files.map((file) => {
		const splt = file.split('.')[0].split('-');
		const a = parseInt(splt[0], 10)
		const b = parseInt(splt[1], 10);

		if (b - a !== 999) {
			console.log('fucked up', file);
		}

		return [a, b];
	});

  ranges = ranges.filter(([ a, b ]) => {
		return b - a === 999;
  });

  ranges = ranges.sort((a, b) => {
    const lowA = a[0];
    const lowB = b[0];

    if (lowA < lowB) {
      return -1;
    }
    if (lowA > lowB) {
      return 1;
    };
    return 0;
  });

  console.log(ranges);

  // const zstd = await Zstd.load();

  const chunks = _.chunk(ranges, 10_000);

  let i = 0;
  for (const chunk of chunks) {
    ++i;

    const first = chunk[0][0];
    const last = chunk[chunk.length - 1][1];
    const blockchainWatcher = await BlockchainWatcher.create(`${first}-${last}`);

    console.log(`${first}-${last} (${i}/${chunks.length})`);

    const bar = new ProgressBar(
      `[:bar] :rate/sec :percent :current/:total ETA::etas`,
      {
        total: chunk.length,
      }
    );

    for (const range of chunk) {
      const transactions: TransactionView[] = JSON.parse(
        await fs.promises.readFile(
          `${VERSION_DIR}/${range[0]}-${range[0] + 999}.json`,
          'utf-8'
        )
      );
      await blockchainWatcher.syncTransactions(transactions);
      bar.tick();
    }

    try {
      await blockchainWatcher.stop();
    } catch (err) {
      if (err !== 'cannot write parquet file with zero rows') {
        console.error(err);
        throw err;
      }
    }
  }

  // bar = new ProgressBar(
  //   `[:bar] :rate/sec :percent :current/:total ETA::etas`,
  //   {
  //     total,
  //   }
  // );

  // for (let i = 0; i < 10_000; ++i) {
  //   const version = i * 1_000;
  //   const content = await fs.promises.readFile(
  //     `${VERSION_DIR}/${version}-${version + 999}.json`,
  //   );
  //   const compressedData = zstd.compress(content);

  //   await new Promise<void>((resolve, reject) => {
  //     S3.upload(
  //       {
  //         Bucket: '0lfyi',
  //         Key: `${version}-${version + 999}.json.zstd`,
  //         Body: compressedData,
  //         StorageClass: 'ONEZONE_IA'
  //       },
  //       (err) => {
  //         if (err) {
  //           console.error(err);
  //           reject(err);
  //           return;
  //         }

  //         resolve();
  //       }
  //     );
  //   });
  //   bar.tick();
  // }


  console.log('done');
};
