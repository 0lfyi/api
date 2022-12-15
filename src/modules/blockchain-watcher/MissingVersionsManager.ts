import _ from "lodash";
import prisma from "../../services/prisma.js";
import rootLogger from '../../logger.js';
import BlockchainWatcher from "./BlockchainWatcher.js";
import config from "../../config.js";

const rangeSize = (inf: number, sup: number) => sup - inf;

class MissingVersionsManager {
  private logger = rootLogger.child({ source: this.constructor.name });

  private blockchainWatcher: BlockchainWatcher;

  public static async create(blockchainWatcher: BlockchainWatcher): Promise<MissingVersionsManager> {
    const missingVersionsManager = new MissingVersionsManager(blockchainWatcher);
    await missingVersionsManager.init();
    return missingVersionsManager;
  }

  private constructor(blockchainWatcher: BlockchainWatcher) {
    this.blockchainWatcher = blockchainWatcher;
  }

  private async init() {
    const total = await this.getTotal();

    if (total === 0) {
      this.logger.debug('O version found. Nothing to do');
      return;
    }

    const max = (await this.getMax())!;

    const missing = await this.countMissingBlocks(1, max);
    if (missing === 0) {
      this.logger.debug('O missing version. Nothing to do');
      return;
    }

    this.logger.debug(`${missing} version missing`);
    await this.processRange(1, max);
  }

  private async processRange(low: number, high: number) {
    if (low > high) {
      throw new Error('low > high');
    }

    const missing = await this.countMissingBlocks(low, high);
    if (missing === 0) {
      this.logger.debug('O missing version. Nothing to do');
      return;
    }

    const size = rangeSize(low, high);

    if (size > config.missingVersionsManager.batchSize) {

      const half = Math.ceil(size / 2);

      if (config.missingVersionsManager.syncFrom === 'end') {
        await this.processRange(low + half + 1, high);
        await this.processRange(low, low + half);
      } else {
        await this.processRange(low, low + half);
        await this.processRange(low + half + 1, high);
      }

    } else {
      await this.getMissingVersions(low, high);
    }
  }

  private async getMissingVersions(low: number, high: number) {
    const expected = high - low + 1;

    if (expected <= 0) {
      throw new Error('expected <= 0');
    }

    const currentRows = await prisma.version.findMany({
      select: {
        version: true,
      },
      where: {
        AND: [
          {
            version: {
              gte: low,
            }
          },
          {
            version: {
              lte: high,
            }
          }
        ]
      },
      orderBy: {
        version: 'asc',
      },
    });

    const currentVersions = currentRows.map((it) => Number(it.version));
    const full = _.map(new Array(expected), (__, index) => index + low);
    const missing = _.difference(full, currentVersions);

    const { length } = missing;
    if (!length) {
      return;
    }

    const promises = new Array(length);

    for (let i = 0; i < length; ++i) {
      const it = missing[i];
      promises[i] = this.blockchainWatcher.syncVersion(it)
        .catch((err) => {
          this.logger.error(`Error syncing version ${it}: ${err.message}`);
        });
    }
  }

  private async countMissingBlocks(min: number, max: number): Promise<number> {
    const expected = max - min + 1;

    if (expected <= 0) {
      return 0;
    }

    const total = await prisma.version.count({
      where: {
        AND: [
          {
            version: {
              gte: min,
            },
          },
          {
            version: {
              lte: max,
            }
          }
        ]
      }
    });

    return expected - total;
  }

  private async getMax(): Promise<number | undefined> {
    const version = await prisma.version.findFirst({
      take: 1,
      orderBy: {
        version: 'desc',
      }
    });
    if (version) {
      return Number(version.version);
    }
    return undefined;
  }

  private async getTotal(): Promise<number> {
    const total = await prisma.version.count();
    return total;
  }
}

export default MissingVersionsManager;
