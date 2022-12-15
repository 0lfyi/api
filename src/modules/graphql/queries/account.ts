import BN from 'bn.js';
import { IFieldResolver } from '@graphql-tools/utils';
import prisma from '../../../services/prisma.js';

interface Args {
  address: string;
}

const accountQuery: IFieldResolver<any, {}, Args> = async (source, args, context) => {
  const account = await prisma.account.findFirst({
    where: {
      address: Buffer.from(args.address, 'hex')
    }
  });

  if (account) {
    return {
      address: account.address.toString('hex'),
      version: new BN(account.version.toString(10)),
      sequenceNumber: new BN(account.sequenceNumber.toString(10)),
      role: account.role,
    };
  }
  return null;
};

export default accountQuery;
