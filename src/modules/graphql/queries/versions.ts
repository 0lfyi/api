import BN from 'bn.js';
import { IFieldResolver } from '@graphql-tools/utils';
import prisma from '../../../services/prisma.js';

interface Args {
  start?: number;
  limit?: number;
}

const versionsQuery: IFieldResolver<any, {}, Args> = async (source, args, context) => {
  let take = 100;
  if (args.limit !== undefined) {
    if (args.limit > 0 && args.limit <= 1000) {
      take = args.limit;
    }
  }

  let start = 0;
  if (args.start !== undefined && args.start >= 0) {
    start = args.start;
  }

  const versions = await prisma.version.findMany({
    take,
    skip: start,
    orderBy: {
      version: 'desc',
    },
  });

  return versions.map((version) => ({
    version: version.version.toString(10),
    accumulatorRootHash: version.accumulatorRootHash.toString('hex'),
    timestamp: new BN(version.timestamp.toString(10)),
  }));
};

export default versionsQuery;
