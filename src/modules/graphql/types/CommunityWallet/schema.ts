import { parse } from 'graphql';

export default parse(`
  type CommunityWallet {
    address: ID!
    link: String
    description: String
  }
`);
