import { Gauge } from 'prom-client';
import prisma from '../../services/prisma.js';
import { registry } from '../../services/prometheus.js';

const gauge = new Gauge({
  name: 'versions_count',
  help: 'number of versions',
  registers: [registry],
});

const job = async () => {
  const totalVersions = await prisma.version.count();
  gauge.set(totalVersions);
};

export default job;
