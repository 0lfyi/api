import { InfluxDB } from '@influxdata/influxdb-client';
import config from '../config.js';

const { token, org, bucket } = config.influxdb;

const client = new InfluxDB({ url: config.influxdb.host, token });

const writeApi = client.getWriteApi(org, bucket);

const queryApi = client.getQueryApi(org);

export { token, org, bucket, writeApi, queryApi };

export default client;
