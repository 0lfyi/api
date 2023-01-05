import { parse } from 'graphql';

export default parse(`
  type Balance {
    amount: BigInt!
    currency: String!
  }

  type Account {
    address: ID!
    sequenceNumber: BigInt!
    version: BigInt!
    role: String!
    balances: [Balance!]!
    paymentEvents: [PaymentEvent!]!
  }
`);
