import { parse } from 'graphql';

export default parse(`
  scalar Coordinates
  scalar Date
  scalar Bytes
  scalar BigInt

  union SearchResult = Account | Version

  type Query {
    account(address: String!): Account
    version(version: Int): Version
    versions(start: Int, limit: Int): [Version!]
    versionCount: BigInt
    search(query: String!): SearchResult
  }
`);
