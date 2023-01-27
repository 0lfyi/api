/* eslint-disable no-bitwise */

import _ from 'lodash';
import parquet from 'parquetjs';
import rootLogger from '../../logger.js';
import Provider from '../0l/Provider.js';
import config from '../../config.js';
import * as schema from './parquet-schema.js';
import { TransactionView } from '../0l/types.js';

class BlockchainWatcher {
  private filesPrefix: string;

  private provider: Provider;

  private logger = rootLogger.child({ source: this.constructor.name });

  // private newBlockEventWriter: parquet.ParquetWriter;

  private sentPaymentEventWriter: parquet.ParquetWriter;

  private receivedPaymentEventWriter: parquet.ParquetWriter;

  private createAccountEventWriter: parquet.ParquetWriter;

  private mintEventWriter: parquet.ParquetWriter;

  private burnEventWriter: parquet.ParquetWriter;

  // private newEpochEventWriter: parquet.ParquetWriter;

  private userTransactionWriter: parquet.ParquetWriter;

  private constructor(filesPrefix: string) {
    this.filesPrefix = filesPrefix;
    this.provider = new Provider(config.providerUrl);
  }

  public static async create(filesPrefix: string): Promise<BlockchainWatcher> {
    const blockchainWatcher = new BlockchainWatcher(filesPrefix);
    await blockchainWatcher.init();
    return blockchainWatcher;
  }

  public async syncTransactions(transactions: TransactionView[]) {
    const promises: Promise<unknown>[] = [];

    for (const transaction of transactions) {
      // const transactionHash = Buffer.from(transaction.hash, 'hex');

      if (transaction.events && transaction.events.length > 0) {
        const { length } = transaction.events;

        for (let i = 0; i < length; ++i) {
          const event = transaction.events[i];

          switch (event.data.type) {
            case 'newblock':
              // promises.push(
              //   this.newBlockEventWriter.appendRow({
              //     version: transaction.version,
              //     timestamp: event.timestamp_usecs,
              //     sequenceNumber: event.sequence_number,

              //     round: event.data.round,
              //     proposer: Buffer.from(event.data.proposer, 'hex') as any,
              //     proposedTime: event.data.proposed_time,
              //   })
              // );
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
              // promises.push(
              //   this.newEpochEventWriter.appendRow({
              //     version: transaction.version,
              //     timestamp: event.timestamp_usecs,
              //     sequenceNumber: event.sequence_number,
              //     epoch: event.data.epoch,
              //   })
              // );
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
          // throw new Error(`Unsupported transaction type ${transactionType}`);
          console.log(`Unsupported transaction type ${transactionType}`);
        }
      }
    }

    await Promise.all(promises);
  }

  public async stop() {
    await Promise.all([
      // this.newBlockEventWriter.close(),
      this.sentPaymentEventWriter.close(),
      this.receivedPaymentEventWriter.close(),
      this.createAccountEventWriter.close(),
      this.mintEventWriter.close(),
      this.burnEventWriter.close(),
      // this.newEpochEventWriter.close(),
      this.userTransactionWriter.close(),
    ]);
  }

  private async init() {
    // this.newBlockEventWriter = await parquet.ParquetWriter.openFile(
    //   schema.NewBlockEvent,
    //   `new-block-events-${this.filesPrefix}.parquet`
    // );

    this.sentPaymentEventWriter = await parquet.ParquetWriter.openFile(
      schema.SentPaymentEvent,
      `sent_payment_events-${this.filesPrefix}.parquet`
    );

    this.receivedPaymentEventWriter = await parquet.ParquetWriter.openFile(
      schema.ReceivedPaymentEvent,
      `received_payment_events-${this.filesPrefix}.parquet`
    );

    this.createAccountEventWriter = await parquet.ParquetWriter.openFile(
      schema.CreateAccountEvent,
      `create_account_events-${this.filesPrefix}.parquet`
    );

    this.mintEventWriter = await parquet.ParquetWriter.openFile(
      schema.MintEvent,
      `mint_events-${this.filesPrefix}.parquet`
    );

    this.burnEventWriter = await parquet.ParquetWriter.openFile(
      schema.BurnEvent,
      `burn_events-${this.filesPrefix}.parquet`
    );

    // this.newEpochEventWriter = await parquet.ParquetWriter.openFile(
    //   schema.NewEpochEvent,
    //   `new_epoch_events-${this.filesPrefix}.parquet`
    // );

    this.userTransactionWriter = await parquet.ParquetWriter.openFile(
      schema.UserTransaction,
      `user_transactions-${this.filesPrefix}.parquet`
    );
  }
}

export default BlockchainWatcher;
