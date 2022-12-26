import _ from 'lodash';
import prisma from '../../services/prisma.js';
import communityWallets from './community-wallets.js';

const seed = async (): Promise<void> => {
  const insertQuery = `
    INSERT INTO "CommunityWallet"
      (
        "address",
        "description",
        "link"
      )
    VALUES ${_.map(
      new Array(communityWallets.length),
      (__, idx) => `(${[`$${idx * 3 + 1}`, `$${idx * 3 + 2}`, `$${idx * 3 + 3}`].join()})`
    ).join()}
    ON CONFLICT DO NOTHING
   `;

  const insertData = _.flatten(
    communityWallets.map((wallet) => [wallet.address, wallet.description, wallet.link])
  );

  await prisma.$executeRawUnsafe(insertQuery, ...insertData);
};

export default seed;
