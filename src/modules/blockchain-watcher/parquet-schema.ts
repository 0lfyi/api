import parquet from 'parquetjs';
import { SchemaInterface } from 'parquetjs/lib/schema.interface';

const eventSchema = (schema: SchemaInterface) => {
  return new parquet.ParquetSchema({
    version: { type: 'UINT_64' },
    timestamp: { type: 'TIMESTAMP_MICROS' },
    sequenceNumber: { type: 'UINT_64' },
    ...schema,
  });
};

export const NewBlockEvent = eventSchema({
  round: { type: 'UINT_64' },
  proposer: { type: 'BYTE_ARRAY' },
  proposedTime: { type: 'TIMESTAMP_MICROS' },
});

export const SentPaymentEvent = eventSchema({
  amount: { type: 'UINT_64' },
  currency: { type: 'UTF8' },
  receiver: { type: 'BYTE_ARRAY' },
  sender: { type: 'BYTE_ARRAY' },
  metadata: { type: 'BYTE_ARRAY' },
});

export const ReceivedPaymentEvent = eventSchema({
  amount: { type: 'UINT_64' },
  currency: { type: 'UTF8' },
  receiver: { type: 'BYTE_ARRAY' },
  sender: { type: 'BYTE_ARRAY' },
  metadata: { type: 'BYTE_ARRAY' },
});

export const CreateAccountEvent = eventSchema({
  createdAddress: { type: 'BYTE_ARRAY' },
  roleId: { type: 'UINT_64' },
});

export const MintEvent = eventSchema({
  amount: { type: 'UINT_64' },
  currency: { type: 'UTF8' },
});

export const BurnEvent = eventSchema({
  amount: { type: 'UINT_64' },
  currency: { type: 'UTF8' },
  preburnAddress: { type: 'BYTE_ARRAY' },
});

export const NewEpochEvent = eventSchema({
  epoch: { type: 'UINT_64' },
});

export const UserTransaction = new parquet.ParquetSchema({
  version: { type: 'UINT_64' },
  timestamp: { type: 'TIMESTAMP_MICROS' },
  sequenceNumber: { type: 'UINT_64' },
  gasUsed: { type: 'UINT_64' },
  maxGasAmount: { type: 'UINT_64' },
  gasUnitPrice: { type: 'UINT_64' },
  gasCurrency: { type: 'UTF8' },
  expirationTimestampSecs: { type: 'UINT_64' },
});
