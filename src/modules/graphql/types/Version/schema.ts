import { parse } from "graphql";

export default parse(`
  type Version {
    version: ID!
    accumulatorRootHash: Bytes
    timestamp: BigInt
    transactions: [Transaction]
  }
`);
