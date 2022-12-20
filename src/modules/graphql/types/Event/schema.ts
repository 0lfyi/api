import { parse } from 'graphql';

export default parse(`
  union Event = NewBlockEvent
`);
