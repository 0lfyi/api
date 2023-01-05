import olProvider from '../../../../services/ol-provider.js';
import prisma from '../../../../services/prisma.js';

const balances = async (
  account: any,
  args: any,
  context: any,
  ...others: any[]
): Promise<any[]> => {
  const accountDetails = await olProvider.getAccount(account.address);
  console.log('accountDetails', accountDetails);

  return accountDetails.balances;
};

interface PaymentEvent {
  sequenceNumber: bigint;
  amount: bigint;
  currency: string;
  receiver: Buffer;
  sender: Buffer;
  metadata: Buffer;
  transactionHash: Buffer;
  timestamp: bigint;
}

const getPaymentEvents = async (
  account: any,
  args: any,
  context: any,
  ...others: any[]
): Promise<any[]> => {
  const accountAddress = Buffer.from(account.address, 'hex');
  const sentPaymentEvents: PaymentEvent[] = await prisma.$queryRaw`
    SELECT
    	"SentPaymentEvent".*,
    	"Version"."timestamp"
    FROM "SentPaymentEvent"
    LEFT JOIN
      "Transaction" ON "Transaction"."hash" = "SentPaymentEvent"."transactionHash"
    LEFT JOIN
      "Version" ON "Version"."version" = "Transaction"."version"
    WHERE
    	"SentPaymentEvent"."sender" = ${accountAddress}
    ORDER BY
      "SentPaymentEvent"."sequenceNumber"
  `;

  const receivedPaymentEvents: PaymentEvent[] = await prisma.$queryRaw`
    SELECT
    	"ReceivedPaymentEvent".*,
    	"Version"."timestamp"
    FROM "ReceivedPaymentEvent"
    LEFT JOIN
      "Transaction" ON "Transaction"."hash" = "ReceivedPaymentEvent"."transactionHash"
    LEFT JOIN
      "Version" ON "Version"."version" = "Transaction"."version"
    WHERE
    	"ReceivedPaymentEvent"."receiver" = ${accountAddress}
    ORDER BY
      "ReceivedPaymentEvent"."sequenceNumber"
  `;

  const paymentEvents = [...sentPaymentEvents, ...receivedPaymentEvents];

  return paymentEvents;
};

export default { balances, paymentEvents: getPaymentEvents };
