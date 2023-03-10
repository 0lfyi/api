import _ from 'lodash';
import { Request, Response } from 'express';
import utils from '../../../../utils/index.js';
import prisma from '../../../../services/prisma.js';

// const HISTORICAL_DATA_TIME_FRAME_DIVISOR = 288;
// 
// export const get = [
//   utils.route(async (req: Request, res: Response) => {
//     const from = parseInt(req.query.from as string, 10);
//     const to = parseInt(req.query.to as string, 10);
// 
//     if (Number.isNaN(from) || Number.isNaN(to) || from < 0 || to < 0 || to <= from) {
//       throw new BadRequest();
//     }
// 
//     // from = from * 1_000;
//     // to = to * 1_000;
// 
//     const timeFrame = Math.ceil((to - from) / HISTORICAL_DATA_TIME_FRAME_DIVISOR);
//     const date = `("Version"."timestamp" / 1000)`;
// 
//     const aggregate = `(${date} - (${date} % ${timeFrame}))`;
// 
//     const start = from - timeFrame;
// 
//     const query = `
//       SELECT
//         (${aggregate} + ${timeFrame}) as "time",
//         (avg("Transaction"."gasUsed")) as "value",
//         "Transaction"."type"
//       FROM "Transaction"
//       INNER JOIN
//         "Version" ON "Version"."version" = "Transaction"."version"
//       AND
//         ${date} BETWEEN ${start} AND ${to}
//       GROUP BY ${aggregate}, "Transaction"."type"
//       ORDER BY ${aggregate}
//     `;
// 
//     const stats = await prisma.version.aggregate({
//       _max: {
//         timestamp: true,
//       },
//       _min: {
//         timestamp: true,
//       },
//     });
// 
//     const rows: {
//       time: bigint;
//       value: string;
//       type: string;
//     }[] = await prisma.$queryRawUnsafe(query);
// 
//     const groups: Record<string, any> = _.groupBy(rows, 'type');
// 
//     for (const group of Object.keys(groups)) {
//       groups[group] = groups[group].map((it: { time: bigint; value: string; type: string }) => [
//         Number(it.time),
//         parseInt(it.value, 10),
//       ]);
//     }
// 
//     res.send({
//       domainX: [
//         Math.floor(Number(stats._min.timestamp) / 1_000),
//         Math.ceil(Number(stats._max.timestamp) / 1_000),
//       ],
//       data: groups,
//     });
//   }),
// ];

export const get = [
  utils.route(async (req: Request, res: Response) => {
    const rows = await prisma.historicalGasUsage.findMany({
      where: {
        type: 'User',
      },
      orderBy: {
        date: 'asc',
      }
    });

    const { length } = rows;
    const result = {
      _time: new Array<number>(length),
      _value: new Array<number>(length),
      volume: new Array<number>(length),
      type:  new Array<string>(length),
    };

    for (let i = 0 ; i < length; ++i) {
      const row = rows[i];
      result._time[i] = row.date.getTime();
      result._value[i] = row.gasUsed;
      result.volume[i] = row.volume;
      result.type[i] = row.type;
    }

    res.send(result);
  }),
];
