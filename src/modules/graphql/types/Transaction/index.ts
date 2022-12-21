import Bluebird from 'bluebird';
import BN from 'bn.js';
import prisma from '../../../../services/prisma.js';

const events = async (
  transaction: any,
  args: any,
  context: any,
  ...others: any[]
): Promise<any[]> => {
  return [];
  // const { newBlockEvents } = await Bluebird.props({
  //   newBlockEvents: prisma.newBlockEvent.findMany({
  //     where: {
  //       transactionVersion: transaction.version,
  //     },
  //   }),
  // });

  // return [
  //   ...newBlockEvents.map((newBlockEvent) => ({
  //     __type: 'NewBlockEvent',
  //     transactionVersion: new BN(newBlockEvent.transactionVersion.toString()),
  //     sequenceNumber: new BN(newBlockEvent.sequenceNumber.toString()),
  //     round: new BN(newBlockEvent.round.toString()),
  //     proposer: newBlockEvent.proposer.toString('hex'),
  //     proposedTime: new BN(newBlockEvent.proposedTime.toString()),
  //   })),
  // ];
};

export default { events };
