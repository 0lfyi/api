import { parse } from 'graphql';

export default parse(`
  type ValidatorPresence {
    vfn: Coordinates
    validator: Coordinates
  }
`);
