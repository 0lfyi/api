import BN from 'bn.js';
import { IFieldResolver } from '@graphql-tools/utils';
import prisma from '../../../services/prisma.js';

const ADDRESS = /^[ABCDEF0-9]{32}$/i;
const VERSION = /^[0-9]*$/;

interface Args {
  query: string;
}

const searchQuery: IFieldResolver<any, {}, Args> = async (source, args, context) => {
  console.log(args);

  const { query } = args;
  if (ADDRESS.test(query)) {
    const account = await prisma.account.findFirst({
      where: {
        address: Buffer.from(args.query, 'hex')
      }
    });

    if (account) {
      return {
        __type: 'Account',
        address: account.address.toString('hex'),
        version: new BN(account.version.toString(10)),
        sequenceNumber: new BN(account.sequenceNumber.toString(10)),
        role: account.role,
      };
    }
  }

  if (VERSION.test(query)) {
    const version = await prisma.version.findFirst({
      where: {
        version: parseInt(query, 10),
      }
    });

    if (version) {
      return {
        __type: 'Version',
        version: version.version.toString(10),
        accumulatorRootHash: version.accumulatorRootHash.toString('hex'),
        timestamp: new BN(version.timestamp.toString(10)),
      };
    }
  }
  return null;
};

export default searchQuery;
