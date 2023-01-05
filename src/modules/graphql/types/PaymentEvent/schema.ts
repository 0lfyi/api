import { parse } from 'graphql';

export default parse(`
  type PaymentEvent {
    sequenceNumber: BigInt!
    amount: BigInt!
    currency: String!
    receiver: Bytes!
    sender: Bytes!
    metadata: Bytes!
    transactionHash: Bytes!
    timestamp: BigInt!
  }
`);
