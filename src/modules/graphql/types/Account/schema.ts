import { parse } from "graphql";

export default parse(`
  type Account {
    address: ID!
    sequenceNumber: BigInt!
    version: BigInt!
    role: String!
  }
`);
