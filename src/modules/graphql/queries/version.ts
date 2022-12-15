import BN from 'bn.js';
import { IFieldResolver } from '@graphql-tools/utils';
import prisma from '../../../services/prisma.js';

interface Args {
  version: number;
}

const versionQuery: IFieldResolver<any, {}, Args> = async (source, args, context) => {
  const version = await prisma.version.findFirst({
    where: {
      version: args.version,
    }
  });

  if (version) {
    return {
      version: version.version.toString(10),
      accumulatorRootHash: version.accumulatorRootHash.toString('hex'),
      timestamp: new BN(version.timestamp.toString(10)),
    };
  }
  return null;
};

export default versionQuery;
