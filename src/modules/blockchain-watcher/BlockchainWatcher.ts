/* eslint-disable no-bitwise */

import _ from 'lodash';
import fs from 'fs';
import parquet from 'parquetjs';
import prisma from '../../services/prisma.js';
import rootLogger from '../../logger.js';
import Provider from '../0l/Provider.js';
import MissingVersionsManager from './MissingVersionsManager.js';
import config from '../../config.js';
import * as schema from './parquet-schema.js';
import { TransactionView } from '../0l/types.js';

const getAccountRoleType = (type: string): string | undefined => {
  const types = new Map([
    ['child_vasp', 'ChildVASP'],
    ['parent_vasp', 'ParentVASP'],
    ['designated_dealer', 'DesignatedDealer'],
    ['treasury_compliance', 'TreasuryCompliance'],
    ['unknown', 'Unknown'],
  ]);
  return types.get(type);
};

const getVMStatusType = (type: string): string | undefined => {
  const types = new Map([
    ['executed', 'Executed'],
    ['out_of_gas', 'OutOfGas'],
    ['move_abort', 'MoveAbort'],
    ['execution_failure', 'ExecutionFailure'],
    ['miscellaneous_error', 'MiscellaneousError'],
    ['verification_error', 'VerificationError'],
    ['deserialization_error', 'DeserializationError'],
    ['publishing_failure', 'PublishingFailure'],
    ['unknown', 'Unknown'],
  ]);
  return types.get(type);
};

const getTransactionType = (type: string): string | undefined => {
  const types = new Map([
    ['blockmetadata', 'BlockMetadata'],
    ['user', 'User'],
    ['writeset', 'WriteSet'],
    ['unknown', 'Unknown'],
  ]);
  return types.get(type);
};

const getEventType = (type: string): string | undefined => {
  const types = new Map([
    ['burn', 'Burn'],
    ['cancelburn', 'CancelBurn'],
    ['mint', 'Mint'],
    ['to_xdx_exchange_rate_update', 'ToXDXExchangeRateUpdate'],
    ['preburn', 'Preburn'],
    ['receivedpayment', 'ReceivedPayment'],
    ['sentpayment', 'SentPayment'],
    ['admintransaction', 'AdminTransaction'],
    ['newepoch', 'NewEpoch'],
    ['newblock', 'NewBlock'],
    ['receivedmint', 'ReceivedMint'],
    ['compliancekeyrotation', 'ComplianceKeyRotation'],
    ['baseurlrotation', 'BaseUrlRotation'],
    ['createaccount', 'CreateAccount'],
    ['diemiddomain', 'DiemIdDomain'],
    ['unknown', 'Unknown'],
  ]);
  return types.get(type);
};

class BlockchainWatcher {
  private provider: Provider;

  private logger = rootLogger.child({ source: this.constructor.name });

  private newBlockEventWriter: parquet.ParquetWriter;

  private sentPaymentEventWriter: parquet.ParquetWriter;

  private receivedPaymentEventWriter: parquet.ParquetWriter;

  private createAccountEventWriter: parquet.ParquetWriter;

  private mintEventWriter: parquet.ParquetWriter;

  private burnEventWriter: parquet.ParquetWriter;

  private newEpochEventWriter: parquet.ParquetWriter;

  private userTransactionWriter: parquet.ParquetWriter;

  private constructor() {
    this.provider = new Provider(config.providerUrl);
  }

  public static async create(): Promise<BlockchainWatcher> {
    const blockchainWatcher = new BlockchainWatcher();
    await blockchainWatcher.init();
    return blockchainWatcher;
  }

  public async syncTransactions(version: number) {
    // const transactions = await this.provider.getTransactions(version, 1, true);
    const transactions: TransactionView[] = JSON.parse(
      await fs.promises.readFile(
        '/Users/will/Projects/133_DATA_PIPELINE/52671000-52671999_clean.json',
        'utf-8'
      )
    );

    const promises: Promise<unknown>[] = [];

    for (const transaction of transactions) {
      // const transactionHash = Buffer.from(transaction.hash, 'hex');

      if (transaction.events && transaction.events.length > 0) {
        const { length } = transaction.events;

        for (let i = 0; i < length; ++i) {
          const event = transaction.events[i];

          switch (event.data.type) {
            case 'newblock':
              promises.push(
                this.newBlockEventWriter.appendRow({
                  version: transaction.version,
                  timestamp: event.timestamp_usecs,
                  sequenceNumber: event.sequence_number,

                  round: event.data.round,
                  proposer: Buffer.from(event.data.proposer, 'hex') as any,
                  proposedTime: event.data.proposed_time,
                })
              );
              break;

            case 'receivedpayment':
              promises.push(
                this.receivedPaymentEventWriter.appendRow({
                  version: transaction.version,
                  timestamp: event.timestamp_usecs,
                  sequenceNumber: event.sequence_number,

                  amount: event.data.amount.amount,
                  currency: event.data.amount.currency,
                  receiver: Buffer.from(event.data.receiver, 'hex') as any,
                  sender: Buffer.from(event.data.sender, 'hex') as any,
                  metadata: Buffer.from(event.data.metadata, 'hex') as any,
                })
              );
              break;

            case 'sentpayment':
              promises.push(
                this.sentPaymentEventWriter.appendRow({
                  version: transaction.version,
                  timestamp: event.timestamp_usecs,
                  sequenceNumber: event.sequence_number,

                  amount: event.data.amount.amount,
                  currency: event.data.amount.currency,
                  receiver: Buffer.from(event.data.receiver, 'hex') as any,
                  sender: Buffer.from(event.data.sender, 'hex') as any,
                  metadata: Buffer.from(event.data.metadata, 'hex') as any,
                })
              );
              break;

            case 'createaccount':
              promises.push(
                this.createAccountEventWriter.appendRow({
                  version: transaction.version,
                  timestamp: event.timestamp_usecs,
                  sequenceNumber: event.sequence_number,
                  createdAddress: Buffer.from(event.data.created_address, 'hex') as any,
                  roleId: event.data.role_id,
                })
              );
              break;

            case 'mint':
              promises.push(
                this.mintEventWriter.appendRow({
                  version: transaction.version,
                  timestamp: event.timestamp_usecs,
                  sequenceNumber: event.sequence_number,
                  amount: event.data.amount.amount,
                  currency: event.data.amount.currency,
                })
              );
              break;

            case 'burn':
              promises.push(
                this.burnEventWriter.appendRow({
                  version: transaction.version,
                  timestamp: event.timestamp_usecs,
                  sequenceNumber: event.sequence_number,
                  amount: event.data.amount.amount,
                  currency: event.data.amount.currency,
                  preburnAddress: Buffer.from(event.data.preburn_address, 'hex') as any,
                })
              );
              break;

            case 'newepoch':
              promises.push(
                this.newEpochEventWriter.appendRow({
                  version: transaction.version,
                  timestamp: event.timestamp_usecs,
                  sequenceNumber: event.sequence_number,
                  epoch: event.data.epoch,
                })
              );
              break;

            default:
              console.log(event.data);
              throw new Error(`Implement ${event.data.type} event please`);
          }
        }
      }

      const transactionType: string = transaction.transaction.type;
      switch (transaction.transaction.type) {
        case 'blockmetadata':
          // noop
          break;

        case 'user':
          promises.push(
            this.userTransactionWriter.appendRow({
              version: transaction.version,
              timestamp: transaction.timestamp_usecs,
              sequenceNumber: transaction.transaction.sequence_number,
              gasUsed: transaction.gas_used,
              maxGasAmount: transaction.transaction.max_gas_amount,
              gasUnitPrice: transaction.transaction.gas_unit_price,
              gasCurrency: transaction.transaction.gas_currency,
              expirationTimestampSecs: transaction.transaction.expiration_timestamp_secs,
            })
          );
          break;

        default: {
          throw new Error(`Unsupported transaction type ${transactionType}`);
        }
      }
    }

    await Promise.all(promises);
  }

  public async syncVersion(version?: number) {
    const metadata = await this.provider.getMetadata(version);
    if (!metadata) {
      this.logger.debug(`SYNCING ${version}: ko`);
      return;
    }

    this.logger.debug(`SYNCING ${metadata!.version}`);

    await this.syncTransactions(version ?? metadata.version);

    await prisma.$executeRaw`
      INSERT INTO "Version"
        (
          "version",
          "accumulatorRootHash",
          "timestamp",
          "chainId",
          "scriptHashAllowList",
          "modulePublishingAllowed",
          "diemVersion",
          "dualAttestationLimit"
        )
      VALUES (
        ${metadata.version},
        ${metadata.accumulatorRootHash},
        ${metadata.timestamp},
        ${metadata.chainId},
        ${
          metadata.scriptHashAllowList
            ? metadata.scriptHashAllowList.map((it) => `\\x${it.toString('hex')}`)
            : undefined
        },
        ${metadata.modulePublishingAllowed},
        ${metadata.diemVersion},
        ${metadata.dualAttestationLimit}
      )
      ON CONFLICT DO NOTHING
    `;
  }

  public async stop() {
    await Promise.all([
      this.newBlockEventWriter.close(),
      this.sentPaymentEventWriter.close(),
      this.receivedPaymentEventWriter.close(),
      this.createAccountEventWriter.close(),
      this.mintEventWriter.close(),
      this.burnEventWriter.close(),
      this.newEpochEventWriter.close(),
      this.userTransactionWriter.close(),
    ]);
  }

  private async syncCurrencies() {
    const currencies = await this.provider.getCurrencies();

    const { length } = currencies;

    const query = `
      INSERT INTO "Currency"
        (
          "code",
          "fractionalPart",
          "scalingFactor",
          "mintEventsKey",
          "burnEventsKey",
          "preburnEventsKey",
          "cancelBurnEventsKey",
          "exchangeRateUpdateEventsKey"
        )
      VALUES ${_.map(
        new Array(length),
        (__, it) =>
          `(${[
            `$${it * 8 + 1}`,
            `$${it * 8 + 2}`,
            `$${it * 8 + 3}`,
            `$${it * 8 + 4}`,
            `$${it * 8 + 5}`,
            `$${it * 8 + 6}`,
            `$${it * 8 + 7}`,
            `$${it * 8 + 8}`,
          ].join()})`
      ).join()}
      ON CONFLICT DO NOTHING
    `;

    const data = new Array(length * 8);

    for (let i = 0; i < length; ++i) {
      const currency = currencies[i];
      data[i * 8 + 0] = currency.code;
      data[i * 8 + 1] = currency.fractionalPart;
      data[i * 8 + 2] = currency.scalingFactor;
      data[i * 8 + 3] = currency.mintEventsKey;
      data[i * 8 + 4] = currency.burnEventsKey;
      data[i * 8 + 5] = currency.preburnEventsKey;
      data[i * 8 + 6] = currency.cancelBurnEventsKey;
      data[i * 8 + 7] = currency.exchangeRateUpdateEventsKey;
    }

    await prisma.$queryRawUnsafe(query, ...data);
  }

  private async init() {
    this.newBlockEventWriter = await parquet.ParquetWriter.openFile(
      schema.NewBlockEvent,
      'new-block-events.parquet'
    );

    this.sentPaymentEventWriter = await parquet.ParquetWriter.openFile(
      schema.SentPaymentEvent,
      'sent-payment-events.parquet'
    );

    this.receivedPaymentEventWriter = await parquet.ParquetWriter.openFile(
      schema.ReceivedPaymentEvent,
      'received-payment-events.parquet'
    );

    this.createAccountEventWriter = await parquet.ParquetWriter.openFile(
      schema.CreateAccountEvent,
      'create-account-events.parquet'
    );

    this.mintEventWriter = await parquet.ParquetWriter.openFile(
      schema.MintEvent,
      'mint-events.parquet'
    );

    this.burnEventWriter = await parquet.ParquetWriter.openFile(
      schema.BurnEvent,
      'burn-events.parquet'
    );

    this.newEpochEventWriter = await parquet.ParquetWriter.openFile(
      schema.NewEpochEvent,
      'new-epoch-events.parquet'
    );

    this.userTransactionWriter = await parquet.ParquetWriter.openFile(
      schema.UserTransaction,
      'user-transactions.parquet'
    );

    // const sync = () => {
    //   this.syncVersion().finally(() => {
    //     setTimeout(() => {
    //       sync();
    //     }, 30_000);
    //   });
    // };

    // await MissingVersionsManager.create(this);
  }

  private async getMax(): Promise<number | undefined> {
    const version = await prisma.version.findFirst({
      take: 1,
      orderBy: {
        version: 'desc',
      },
    });
    if (version) {
      return Number(version.version);
    }
    return undefined;
  }

  private async findMin(from: number): Promise<number> {
    let low = 1;
    let high = from;

    while (low < high) {
      const mid = (low + high) >>> 1;
      const tx = await this.provider.getTransactions(mid, 1, false);
      if (!tx) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    return low;
  }

  private async syncAccount(address: string) {
    const account = await this.provider.getAccount(address);

    await prisma.$executeRaw`
      INSERT INTO "Account"
        (
          "address",
          "sequenceNumber",
          "authenticationKey",
          "sentEventsKey",
          "receivedEventsKey",
          "delegatedKeyRotationCapability",
          "delegatedWithdrawalCapability",
          "isFrozen",
          "role",
          "version"
        )
      VALUES
        (
          ${Buffer.from(account.address, 'hex')},
          ${account.sequence_number},
          ${Buffer.from(account.authentication_key, 'hex')},
          ${Buffer.from(account.sent_events_key, 'hex')},
          ${Buffer.from(account.received_events_key, 'hex')},
          ${account.delegated_key_rotation_capability},
          ${account.delegated_withdrawal_capability},
          ${account.is_frozen},
          (${getAccountRoleType(account.role.type)!})::"AccountRole",
          ${account.version}
        )
      ON CONFLICT ("address")
      DO UPDATE SET
        "isFrozen" = EXCLUDED."isFrozen"
    `;
  }
}

export default BlockchainWatcher;
