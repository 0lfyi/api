import BN from "bn.js";
import prisma from "../../../../services/prisma.js";

const transactions = async (
  version: any,
  args: any,
  context: any,
  ...others: any[]
): Promise<any[]> => {
  const transactions = await prisma.transaction.findMany({
    where: {
      version: parseInt(version.version, 10),
    }
  });
  return transactions.map((transaction) => ({
    version: transaction.version,
    hash: transaction.hash.toString('hex'),
    gasUsed: new BN(transaction.gasUsed.toString(10)),
    vmStatus: transaction.vmStatus,
    type: transaction.type,
  }));
};

export default { transactions };
