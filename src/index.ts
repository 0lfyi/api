import { loadConfig } from './config.js';
import logger from './logger.js';

const main = async (): Promise<void> => {
  await loadConfig();

  const originalTimezoneOffset = new Date().getTimezoneOffset();

  const { TZ } = process.env;

  if (!TZ || TZ !== 'UTC') {
    logger.warn(`Forcing UTC timezone. Was ${TZ}.`);
    process.env.TZ = 'UTC';
  }

  if (originalTimezoneOffset !== 0) {
    logger.error(`Timezone offset changed from ${originalTimezoneOffset}. Please set env TZ=UTC.`);
  }

  const timezoneOffset = new Date().getTimezoneOffset();
  if (timezoneOffset !== 0) {
    throw new Error(`Invalid timezone offset: ${timezoneOffset}. Must be 0.`);
  }

  await import('./main.js');
};

main();

export default main;
