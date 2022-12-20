import { Reader, ReaderModel } from '@maxmind/geoip2-node';
import config from '../config.js';

const getReader = async (): Promise<ReaderModel> => {
  const reader = await Reader.open(config.maxmind.dbPath);
  return reader;
};

export default getReader;
