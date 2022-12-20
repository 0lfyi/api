import { parse } from 'graphql';

export default parse(`
  type NewBlockEvent {
    transactionVersion: BigInt
    sequenceNumber: BigInt
    round: BigInt
    proposer: Bytes
    proposedTime: BigInt
  }
`);
