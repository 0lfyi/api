import BN from "bn.js";
import prisma from "../../../../services/prisma.js";

const events = async (
  transaction: any,
  args: any,
  context: any,
  ...others: any[]
): Promise<any[]> => {
  console.log(transaction);
  return [];
};

export default { events };
