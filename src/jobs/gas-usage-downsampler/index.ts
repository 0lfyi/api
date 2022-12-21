import rootLogger from '../../logger.js';
import prisma from '../../services/prisma.js';

class GasUsageDownsampler {
  private logger = rootLogger.child({ source: this.constructor.name });

  private constructor() {
  }

  public static async create(): Promise<GasUsageDownsampler> {
    const gasUsageDownsampler = new GasUsageDownsampler();
    await gasUsageDownsampler.init();
    return gasUsageDownsampler;
  }

  private async init() {
    this.logger.debug('hello');

    const stats = await prisma.version.aggregate({
      _max: {
        timestamp: true,
      },
      _min: {
        timestamp: true,
      },
    });

    console.log(stats);
  }
}

const gasUsageDownsamplerJob = async () => {
  const gasUsageDownsampler = await GasUsageDownsampler.create();
};

export default gasUsageDownsamplerJob;
