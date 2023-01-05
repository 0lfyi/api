import Account from './Account/schema.js';
import Version from './Version/schema.js';
import Transaction from './Transaction/schema.js';
import Event from './Event/schema.js';
import NewBlockEvent from './NewBlockEvent/schema.js';
import ValidatorPresence from './ValidatorPresence/schema.js';
import CommunityWallet from './CommunityWallet/schema.js';
import PaymentEvent from './PaymentEvent/schema.js';

export default [
  Account,
  Version,
  Transaction,
  Event,
  NewBlockEvent,
  ValidatorPresence,
  CommunityWallet,
  PaymentEvent,
];
