import { IFieldResolver } from '@graphql-tools/utils';
import prisma from '../../../services/prisma.js';

const parseLocation = (location: string): [number, number] => {
  const values = location.substring(1, location.length - 1).split(',');
  return [parseFloat(values[0]), parseFloat(values[1])];
};

const validatorPresences: IFieldResolver<any, any, any> = async (source, args, context) => {
  const rows: {
    vfnLocation: string;
    validatorLocation: string;
  }[] = await prisma.$queryRaw`
    SELECT
    	"ValidatorPresence"."vfnLocation"::text,
    	"ValidatorPresence"."validatorLocation"::text
    FROM
    	"ValidatorPresence"
    LEFT JOIN "Validator"
    	ON "Validator"."id" = "ValidatorPresence"."validatorId"
    WHERE
    	"createdAt" = (
    		SELECT
    			max("createdAt")
    		FROM
    			"ValidatorPresence"
    	)
  `;

  return rows.map((row) => ({
    vfn: row.vfnLocation ? parseLocation(row.vfnLocation) : null,
    validator: row.validatorLocation ? parseLocation(row.validatorLocation) : null,
  }));
};

export default validatorPresences;
