/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-underscore-dangle */
import type { TransactionType } from '@prisma/client';
import _ from 'lodash';
import rootLogger from '../../logger.js';
import prisma from '../../services/prisma.js';

class GasUsageDownsampler {
  private batchSize = 1_000;

  private sampleSize = 5 * 60 * 1_000; // 5m

  private logger = rootLogger.child({ source: this.constructor.name });

  private constructor() {}

  public static async create(): Promise<GasUsageDownsampler> {
    const gasUsageDownsampler = new GasUsageDownsampler();
    await gasUsageDownsampler.init();
    return gasUsageDownsampler;
  }

  private static truncateTimestamp(timestamp: bigint): number {
    return Math.floor(Number(timestamp) / 1_000);
  }

  private normalizeTimestamp(timestamp: bigint): number {
    const truncated = GasUsageDownsampler.truncateTimestamp(timestamp);
    return truncated - (truncated % this.sampleSize);
  }

  private async init() {
    this.logger.debug('hello');

    const srcStats = await prisma.version.aggregate({
      _max: {
        timestamp: true,
      },
      _min: {
        timestamp: true,
      },
    });

    if (srcStats._max.timestamp === null || srcStats._min.timestamp === null) {
      return;
    }

    const srcStart = this.normalizeTimestamp(srcStats._min.timestamp);
    const srcEnd = this.normalizeTimestamp(srcStats._max.timestamp);

    for (let it = srcStart; it <= srcEnd; it += this.sampleSize) {
      // const downSampledData: {
      //   date: number;
      //   gasUsed: number;
      //   volume: number;
      //   type: TransactionType;
      // }[] = [];

      const sample: {
        timestamp: bigint;
        gasUsed: bigint;
        type: TransactionType;
      }[] = await prisma.$queryRaw`
        SELECT
          "Version"."timestamp",
          "Transaction"."gasUsed",
          "Transaction"."type"
        FROM "Version"
        LEFT JOIN
          "Transaction" ON "Transaction"."version" = "Version"."version"
        WHERE
          "Version"."timestamp" >= ${it * 1_000}
        AND
          "Version"."timestamp" <= ${(it + this.batchSize * this.sampleSize) * 1_000}
      `;

      const typesSample = _.groupBy(sample, 'type');

      for (const type of Object.keys(typesSample)) {
        const sampleFrames = _.groupBy(typesSample[type], (value) =>
          this.normalizeTimestamp(value.timestamp)
        );

        for (const timestamp of Object.keys(sampleFrames)) {
          const frames = sampleFrames[timestamp];
          const volume = frames.length;
          const values = frames.map((frame) => Number(frame.gasUsed));
          const value = values.reduce((prev, curr) => prev + curr, 0) / volume;

          const downSampledData: {
            date: number;
            gasUsed: number;
            volume: number;
            type: TransactionType;
          }[] = [];

          downSampledData.push({
            date: parseInt(timestamp, 10),
            gasUsed: value,
            volume,
            type: type as TransactionType,
          });

          const query = `
            INSERT INTO "HistoricalGasUsage"
              (
                "gasUsed",
                "volume",
                "date",
                "type"
              )
            VALUES ${_.map(
              new Array(downSampledData.length),
              (__, idx) =>
                `(${[
                  `$${idx * 4 + 1}`,
                  `$${idx * 4 + 2}`,
                  `$${idx * 4 + 3}`,
                  `($${idx * 4 + 4})::"TransactionType"`,
                ].join()})`
            ).join()}
            ON CONFLICT ("date", "type")
            DO UPDATE SET 
              "gasUsed" = EXCLUDED."gasUsed",
              "volume" = EXCLUDED."volume"
            `;

          const queryData = _.flatten(
            downSampledData.map((it) => [it.gasUsed, it.volume, new Date(it.date), it.type])
          );

          try {
            console.log(queryData);
            await prisma.$queryRawUnsafe(query, ...queryData);
          } catch (err) {
            console.log(query, queryData);
            throw err;
          }
        }
      }

      // const query = `
      //   INSERT INTO "HistoricalGasUsage"
      //     (
      //       "gasUsed",
      //       "volume",
      //       "date",
      //       "type"
      //     )
      //   VALUES ${_.map(
      //     new Array(downSampledData.length),
      //     (__, idx) =>
      //       `(${[
      //         `$${idx * 4 + 1}`,
      //         `$${idx * 4 + 2}`,
      //         `$${idx * 4 + 3}`,
      //         `($${idx * 4 + 4})::"TransactionType"`,
      //       ].join()})`
      //   ).join()}
      //   ON CONFLICT ("date", "type")
      //   DO UPDATE SET 
      //     "gasUsed" = EXCLUDED."gasUsed",
      //     "volume" = EXCLUDED."volume"
      // `;

      // const queryData = _.flatten(
      //   downSampledData.map((it) => [it.gasUsed, it.volume, new Date(it.date), it.type])
      // );

      // try {
      //   await prisma.$queryRawUnsafe(query, ...queryData);
      // } catch (err) {
      //   console.log(query, queryData);
      //   throw err;
      // }
    }

    // const destStats = await prisma.historicalGasUsage.aggregate({
    //   _max: {
    //     date: true,
    //   },
    //   _min: {
    //     date: true,
    //   },
    // });

    // console.log(destStats);
  }
}

const gasUsageDownsamplerJob = async () => {
  const gasUsageDownsampler = await GasUsageDownsampler.create();
};

export default gasUsageDownsamplerJob;
