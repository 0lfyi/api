import BN from 'bn.js';
import { IFieldResolver } from '@graphql-tools/utils';
import prisma from '../../../services/prisma.js';

const versionCountQuery: IFieldResolver<any, {}> = async (source, args, context) => {
  const total = await prisma.version.count();
  return new BN(total);
};

export default versionCountQuery;
