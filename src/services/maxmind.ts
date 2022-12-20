import { Reader, ReaderModel } from '@maxmind/geoip2-node';

const getReader = async (): Promise<ReaderModel> => {
  const reader = await Reader.open('/Users/will/Projects/123_0L/GeoLite2-City.mmdb');
  return reader;
};

export default getReader;
