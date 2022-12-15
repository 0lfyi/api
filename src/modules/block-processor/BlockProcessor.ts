import rootLogger from '../../logger.js';
import Provider from "../0l/Provider.js";
import config from "../../config.js";

class BlockProcessor {
  private provider: Provider;

  private logger = rootLogger.child({ source: this.constructor.name });

  private constructor() {
    this.provider = new Provider(config.providerUrl);
  }

  public static async create(): Promise<BlockProcessor> {
    const blockchainProcessor = new BlockProcessor();
    await blockchainProcessor.init();
    return blockchainProcessor;
  }

  private async init() {
  }
}

export default BlockProcessor;
