import { IFieldResolver } from '@graphql-tools/utils';
import prisma from '../../../services/prisma.js';

const communityWalletsQuery: IFieldResolver<any, {}, {}> = async (source, args, context) => {
  const communityWallets = await prisma.communityWallet.findMany();

  return communityWallets.map((wallet) => ({
    address: wallet.address.toString('hex'),
    description: wallet.description,
    link: wallet.link,
  }));
};

export default communityWalletsQuery;
