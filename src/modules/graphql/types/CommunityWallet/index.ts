import BN from 'bn.js';
import prisma from '../../../../services/prisma.js';

const getAccount = async (
  communityWallet: any,
  args: any,
  context: any,
  ...others: any[]
): Promise<any> => {
  const account = await prisma.account.findFirst({
    where: {
      address: Buffer.from(communityWallet.address, 'hex'),
    },
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

export default { account: getAccount };
