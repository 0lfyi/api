import _ from "lodash";
import prisma from "../../services/prisma.js";
import rootLogger from '../../logger.js';
import Provider from "../0l/Provider.js";
import MissingVersionsManager from "./MissingVersionsManager.js";
import config from "../../config.js";

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

  private constructor() {
    this.provider = new Provider(config.providerUrl);
  }

  public static async create(): Promise<BlockchainWatcher> {
    const blockchainWatcher = new BlockchainWatcher();
    await blockchainWatcher.init();
    return blockchainWatcher;
  }

  private async init() {
    await this.syncVersion();

    // await this.syncAccount('d0383924341821f9e43a6cff46f0a74e');

    setInterval(() => {
      this.syncVersion().catch((err) => {
        console.log(err);
      });
    }, 5_000);

    const missingVersionsManager = await MissingVersionsManager.create(this);

    // console.log('fetching....');
    // const accounts: { sender: Buffer }[] = await prisma.$queryRaw`
    //   SELECT DISTINCT "sender" FROM "ReceivedPaymentEvent"
    // `;
    // console.log('done', accounts.length);

    // for (const account of accounts) {
    //   const address = account.sender.toString('hex')
    //   console.log(address);
    //   await this.syncAccount(address);
    // }


    // await this.syncTransactions(82571788);

    // await this.syncCurrencies();
  }

  private async getMax(): Promise<number | undefined> {
    const version = await prisma.version.findFirst({
      take: 1,
      orderBy: {
        version: 'desc',
      }
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
      const mid = low + high >>> 1;
      console.log(low, high, mid);
      const tx = await this.provider.getTransactions(mid, 1, false);
      if (!tx) {
        low = mid + 1
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
      DO UPDATE
          SET "isFrozen" = EXCLUDED."isFrozen"
    `;
  }

  public async syncTransactions(version: number) {
    const transactions = await this.provider.getTransactions(
      version,
      1,
      true
    );

    for (const transaction of transactions) {
      if (transaction.events) {
        for (const event of transaction.events) {

          switch (event.data.type) {
            case "newblock":
              await prisma.$executeRaw`
                INSERT INTO "NewBlockEvent"
                  (
                    "transactionVersion",
                    "sequenceNumber",
                    "round",
                    "proposer",
                    "proposedTime"
                  )
                VALUES
                  (
                    ${event.transaction_version},
                    ${event.sequence_number},
                    ${event.data.round},
                    ${Buffer.from(event.data.proposer, 'hex')},
                    ${event.data.proposed_time}
                  )
                ON CONFLICT DO NOTHING
              `;
              break;

            case "receivedpayment":
              await prisma.$executeRaw`
                INSERT INTO "ReceivedPaymentEvent"
                  (
                    "transactionVersion",
                    "sequenceNumber",
                    "amount",
                    "currency",
                    "receiver",
                    "sender",
                    "metadata"
                  )
                VALUES
                  (
                    ${event.transaction_version},
                    ${event.sequence_number},
                    ${event.data.amount.amount},
                    ${event.data.amount.currency},
                    ${Buffer.from(event.data.receiver, 'hex')},
                    ${Buffer.from(event.data.sender, 'hex')},
                    ${Buffer.from(event.data.metadata, 'hex')}
                  )
                ON CONFLICT DO NOTHING
              `;
              break;

            case "sentpayment":
              await prisma.$executeRaw`
                INSERT INTO "SentPaymentEvent"
                  (
                    "transactionVersion",
                    "sequenceNumber",
                    "amount",
                    "currency",
                    "receiver",
                    "sender",
                    "metadata"
                  )
                VALUES
                  (
                    ${event.transaction_version},
                    ${event.sequence_number},
                    ${event.data.amount.amount},
                    ${event.data.amount.currency},
                    ${Buffer.from(event.data.receiver, 'hex')},
                    ${Buffer.from(event.data.sender, 'hex')},
                    ${Buffer.from(event.data.metadata, 'hex')}
                  )
                ON CONFLICT DO NOTHING
              `;
              break;

            case "createaccount":
              await prisma.$executeRaw`
                INSERT INTO "CreateAccountEvent"
                  (
                    "transactionVersion",
                    "sequenceNumber",
                    "createdAddress",
                    "roleId"
                  )
                VALUES
                  (
                    ${event.transaction_version},
                    ${event.sequence_number},
                    ${Buffer.from(event.data.created_address, 'hex')},
                    ${event.data.role_id}
                  )
                ON CONFLICT DO NOTHING
              `;
              await this.syncAccount(event.data.created_address);
              break;

            case "mint":
              await prisma.$executeRaw`
                INSERT INTO "MintEvent"
                  (
                    "transactionVersion",
                    "sequenceNumber",
                    "amount",
                    "currency"
                  )
                VALUES
                  (
                    ${event.transaction_version},
                    ${event.sequence_number},
                    ${event.data.amount.amount},
                    ${event.data.amount.currency}
                  )
                ON CONFLICT DO NOTHING
              `;
              break;
            
            case "burn":
              await prisma.$executeRaw`
                INSERT INTO "BurnEvent"
                  (
                    "transactionVersion",
                    "sequenceNumber",
                    "amount",
                    "currency",
                    "preburnAddress"
                  )
                VALUES
                  (
                    ${event.transaction_version},
                    ${event.sequence_number},
                    ${event.data.amount.amount},
                    ${event.data.amount.currency},
                    ${Buffer.from(event.data.preburn_address, 'hex')}
                  )
                ON CONFLICT DO NOTHING
              `;
              break;

            case "newepoch":
              await prisma.$executeRaw`
                INSERT INTO "NewEpochEvent"
                  (
                    "transactionVersion",
                    "sequenceNumber",
                    "epoch"
                  )
                VALUES
                  (
                    ${event.transaction_version},
                    ${event.sequence_number},
                    ${event.data.epoch}
                  )
                ON CONFLICT DO NOTHING
              `;
              break;

            default:
              console.log(event.data);
              throw new Error(`Implement ${event.data.type} event please`);
          }

          await prisma.$executeRaw`
            INSERT INTO "Event"
              (
                "key",
                "transactionVersion",
                "sequenceNumber",
                "type"
              )
            VALUES
              (
                ${Buffer.from(event.key, 'hex')},
                ${event.transaction_version},
                ${event.sequence_number},
                (${getEventType(event.data.type)!})::"EventType"
              )
            ON CONFLICT DO NOTHING
          `;
        }
      }

      const transactionType: string = transaction.transaction.type;
      switch (transaction.transaction.type) {
        case 'blockmetadata':
          await prisma.$executeRaw`
            INSERT INTO "BlockMetadataTransaction"
              (
                "hash",
                "timestampUsecs"
              )
            VALUES
              (
                ${Buffer.from(transaction.hash, 'hex')},
                ${transaction.transaction.timestamp_usecs}
              )
            ON CONFLICT DO NOTHING
          `;
          break;

        case 'user':
          await prisma.$executeRaw`
            INSERT INTO "UserTransaction"
              (
                "hash",
                "sender",
                "signatureScheme",
                "signature",
                "publicKey",
                "secondarySigners",
                "secondarySignatureSchemes",
                "secondarySignatures",
                "secondaryPublicKeys",
                "sequenceNumber",
                "chainId",
                "maxGasAmount",
                "gasUnitPrice",
                "gasCurrency",
                "expirationTimestampSecs",
                "scriptHash",
                "scriptBytes",
                "script"
              )
            VALUES
              (
                ${Buffer.from(transaction.hash, 'hex')},
                ${Buffer.from(transaction.transaction.sender, 'hex')},
                ${transaction.transaction.signature_scheme},
                ${Buffer.from(transaction.transaction.signature, 'hex')},
                ${Buffer.from(transaction.transaction.public_key, 'hex')},
                ${
                  transaction.transaction.secondary_signers
                    ? transaction.transaction.secondary_signers.map((signer) => Buffer.from(signer, 'hex'))
                    : []
                },
                ${
                  transaction.transaction.secondary_signature_schemes
                    ? transaction.transaction.secondary_signature_schemes
                    : []
                },
                ${
                  transaction.transaction.secondary_signatures
                    ? transaction.transaction.secondary_signatures.map((signature) => Buffer.from(signature, 'hex'))
                    : []
                },
                ${
                  transaction.transaction.secondary_public_keys
                    ? transaction.transaction.secondary_public_keys.map((publicKey) => Buffer.from(publicKey, 'hex'))
                    : []
                },
                ${transaction.transaction.sequence_number},
                ${transaction.transaction.chain_id},
                ${transaction.transaction.max_gas_amount},
                ${transaction.transaction.gas_unit_price},
                ${transaction.transaction.gas_currency},
                ${transaction.transaction.expiration_timestamp_secs},
                ${Buffer.from(transaction.transaction.script_hash, 'hex')},
                ${Buffer.from(transaction.transaction.script_bytes, 'hex')},
                ${transaction.transaction.script}
              )
            ON CONFLICT DO NOTHING
          `;
          break;

        default: {
          throw new Error(`Unsupported transaction type ${transactionType}`);
        }
      }

      await prisma.$executeRaw`
        INSERT INTO "Transaction"
          (
            "hash",
            "version",
            "bytes",
            "gasUsed",
            "vmStatus",
            "type"
          )
        VALUES
          (
            ${Buffer.from(transaction.hash, 'hex')},
            ${transaction.version},
            ${Buffer.from(transaction.bytes, 'hex')},
            ${transaction.gas_used},
            (${getVMStatusType(transaction.vm_status.type)!})::"VMStatus",
            (${getTransactionType(transaction.transaction.type)!})::"TransactionType"
          )
        ON CONFLICT DO NOTHING
      `;
    }
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
        ${metadata.scriptHashAllowList ? metadata.scriptHashAllowList.map((it) => `\\x${it.toString('hex')}`) : undefined},
        ${metadata.modulePublishingAllowed},
        ${metadata.diemVersion},
        ${metadata.dualAttestationLimit}
      )
      ON CONFLICT DO NOTHING
    `;
  }

  private async syncCurrencies() {
    const currencies = await this.provider.getCurrencies();

    const length = currencies.length;

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
        new Array(currencies.length),
        (__, it) => `(${[
          `$${it + 1}`,
          `$${it + 2}`,
          `$${it + 3}`,
          `$${it + 4}`,
          `$${it + 5}`,
          `$${it + 6}`,
          `$${it + 7}`,
          `$${it + 8}`,
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
}

export default BlockchainWatcher;
