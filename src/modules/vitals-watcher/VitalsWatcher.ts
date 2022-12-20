import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { Point, stringToLines } from '@influxdata/influxdb-client';
import EventSource from 'eventsource';
import { writeApi } from '../../services/influxdb.js';
import rootLogger from '../../logger.js';
import config from '../../config.js';
import prisma from '../../services/prisma.js';
import getMaxmindReader from '../../services/maxmind.js';

interface Validator {
  account_address: string;
  pub_key: string;
  voting_power: number;
  vfn_full_ip: string;
  vfn_ip: string;
  validator_full_ip: string;
  validator_ip: string;
  ports_status: Record<string, boolean>;
  tower_height: number;
  tower_epoch: number;
  count_proofs_in_epoch: number;
  epochs_validating_and_mining: number;
  contiguous_epochs_validating_and_mining: number;
  epochs_since_last_account_creation: number;
  vote_count_in_epoch: number;
  prop_count_in_epoch: number;
  validator_config: {
    operator_account: string;
    operator_has_balance: boolean;
  };
  autopay: {
    payments: {
      uid: number;
      in_type: number;
      type_desc: string;
      payee: string;
      end_epoch: number;
      prev_bal: number;
      amt: number;
      amount: string;
      note: string;
    }[];
    recurring_sum: number;
  };
  burn_to_community: boolean;
  note: string;
}

interface VitalMessage {
  type: string;
  lastEventId: string;
  data: string;
  origin: string;
}

interface VitalPayload {
  items: {
    configs_exist: boolean;
    db_files_exist: boolean;
    db_restored: boolean;
    account_created: boolean;
    node_running: boolean;
    miner_running: boolean;
    web_running: boolean;
    node_mode: string;
    is_synced: boolean;
    sync_height: number;
    sync_delay: number;
    validator_set: boolean;
    has_autopay: boolean;
    has_operator_set: boolean;
    has_operator_positive_balance: boolean;
  };
  account_view: {
    address: string;
    balance: number;
    is_in_validator_set: boolean;
    autopay: unknown | null;
    operator_account: unknown | null;
    operator_balance: unknown | null;
  };
  chain_view: {
    epoch: number;
    height: number;
    validator_count: number;
    total_supply: number;
    latest_epoch_change_time: number;
    epoch_progress: number;
    waypoint: unknown | null;
    upgrade: {
      upgrade: {
        id: number;
        validators_voted: string[];
        vote_counts: [
          {
            data: number[];
            validators: string[];
            hash: number[];
            total_weight: number;
          }
        ];
        votes: {
          validator: string;
          data: number[];
          version_id: string;
          weight: number;
        }[];
        vote_window: number;
        version_id: number;
        consensus: {
          data: number[];
          validators: string[];
          hash: number[];
          total_weight: number;
        };
      };
    };
    validator_view: Validator[];
    validators_stats: {
      history: {
        addr: string[];
        prop_count: number[];
        vote_count: number[];
        total_votes: number;
        total_props: number;
      }[];
    };
    vals_config_stats: {
      total_vals: number;
      count_vals_with_autopay: number;
      count_vals_with_operator: number;
      count_positive_balance_operators: number;
      percent_vals_with_autopay: number;
      percent_vals_with_operator: number;
      percent_positive_balance_operators: number;
    };
    autopay_watch_list: {
      address: string;
      note: string;
      balance: number;
      payers: number;
      average_percent: number;
      sum_percentage: number;
      all_percentage: number;
    }[];
  };
  node_proc: null;
  miner_proc: null;
  monitor_proc: null;
  host_state: {
    onboard_state: string;
    node_state: string;
    miner_state: string;
    monitor_state: string;
    account_state: string;
  };
}

class VitalsWatcher {
  private logger = rootLogger.child({ source: this.constructor.name });

  private constructor() {}

  public static async create(): Promise<VitalsWatcher> {
    const vitalsWatcher = new VitalsWatcher();
    await vitalsWatcher.init();
    return vitalsWatcher;
  }

  private async init() {
    const vitalsUrl = new URL(config.vitalsUrl);

    const headers: any = {};

    if (vitalsUrl.username || vitalsUrl.password) {
      const creds = Buffer.from(`${vitalsUrl.username}:${vitalsUrl.password}`).toString('base64');
      headers.authorization = `Basic ${creds}`;
      vitalsUrl.username = '';
      vitalsUrl.password = '';
    }

    const eventSource = new EventSource(vitalsUrl.toString(), {
      headers,
    });

    eventSource.onmessage = (message: VitalMessage) => {
      try {
        const data = JSON.parse(message.data) as VitalPayload;
        this.onMessage(data);
      } catch (err) {
        console.log(err);
      }
    };
  }

  private async onMessage(message: VitalPayload) {
    await this.saveMetrics(message);
    await this.saveValidators(message);
    await this.saveValidatorPresences(message);
  }

  private async saveMetrics(message: VitalPayload) {
    const points: Point[] = [];

    const metrics = [
      'voting_power',
      'tower_height',
      'tower_epoch',
      'count_proofs_in_epoch',
      'epochs_validating_and_mining',
      'contiguous_epochs_validating_and_mining',
      'epochs_since_last_account_creation',
      'vote_count_in_epoch',
      'prop_count_in_epoch',
    ];

    for (const validator of message.chain_view.validator_view) {
      for (const metric of metrics) {
        const point = new Point(metric);
        point.tag('account_address', validator.account_address);
        point.tag('vfn_ip', validator.vfn_ip);
        point.tag('validator_ip', validator.validator_ip);
        point.floatField('value', (validator as any)[metric] as number);
        points.push(point);
      }
    }

    writeApi.writePoints(points);
    await writeApi.flush();
  }

  private async saveValidators(message: VitalPayload) {
    const validators = message.chain_view.validator_view;

    const query = `
      INSERT INTO "Validator"
        (
          "id",
          "accountAddress",
          "vfnIp",
          "validatorIp"
        )
      VALUES ${_.map(
        new Array(validators.length),
        (__, it) =>
          `(${[
            `($${it * 4 + 1})::uuid`,
            `($${it * 4 + 2})`,
            `($${it * 4 + 3})::inet`,
            `($${it * 4 + 4})::inet`,
          ].join()})`
      ).join()}
      ON CONFLICT DO NOTHING
    `;

    const data = new Array(validators.length * 4);

    for (let i = 0; i < validators.length; ++i) {
      const validator = validators[i];
      data[i * 4 + 0] = uuid();
      data[i * 4 + 1] = Buffer.from(validator.account_address, 'hex');
      data[i * 4 + 2] = validator.vfn_ip;
      data[i * 4 + 3] = validator.validator_ip;
    }

    await prisma.$executeRawUnsafe(query, ...data);
  }

  private async saveValidatorPresences(message: VitalPayload) {
    const validators = message.chain_view.validator_view;

    const selectQuery = `
      SELECT
        "id",
        "accountAddress",
        "vfnIp",
        "validatorIp"
      FROM "Validator"
      WHERE
        ${_.map(new Array(validators.length), (__, it) => {
          return [
            '(',
            `  "accountAddress" = ($${it * 3 + 1})`,
            `  AND "vfnIp" = ($${it * 3 + 2})::inet`,
            `  AND "validatorIp" = ($${it * 3 + 3})::inet`,
            ')',
          ].join(' ');
        }).join(' OR ')}
    `;

    const whereClauseData = new Array(validators.length * 3);

    for (let i = 0; i < validators.length; ++i) {
      const validator = validators[i];
      whereClauseData[i * 3 + 0] = Buffer.from(validator.account_address, 'hex');
      whereClauseData[i * 3 + 1] = validator.vfn_ip;
      whereClauseData[i * 3 + 2] = validator.validator_ip;
    }

    const validatorRows: {
      id: string;
      accountAddress: Buffer;
      vfnIp: string;
      validatorIp: string;
    }[] = await prisma.$queryRawUnsafe(selectQuery, ...whereClauseData);

    const maxmindReader = await getMaxmindReader();
    const insertData = new Array(validators.length);

    for (let i = 0; i < validators.length; ++i) {
      const validator = validators[i];

      const validatorRow = validatorRows.find((row) => {
        const accountAddress = Buffer.from(validator.account_address, 'hex');
        return (
          row.accountAddress.equals(accountAddress) &&
          row.vfnIp === validator.vfn_ip &&
          row.validatorIp === validator.validator_ip
        );
      });

      if (!validatorRow) {
        throw new Error(`Unable to retreive validator row`);
      }

      const validatorLocation =
        validator.validator_ip !== '0.0.0.0'
          ? maxmindReader.city(validator.validator_ip)
          : undefined;
      const vfnLocation =
        validator.vfn_ip !== '0.0.0.0' ? maxmindReader.city(validator.vfn_ip) : undefined;

      insertData[i] = `(${[
        `'${validatorRow.id}'::uuid`,
        vfnLocation && vfnLocation.location
          ? `'(${vfnLocation.location.latitude},${vfnLocation.location.longitude})'::point`
          : 'null',
        validatorLocation && validatorLocation.location
          ? `'(${validatorLocation.location.latitude},${validatorLocation.location.longitude})'::point`
          : 'null',
      ].join()})`;
    }

    const insertQuery = `
      INSERT INTO "ValidatorPresence"
        ("validatorId", "vfnLocation", "validatorLocation")
      VALUES ${insertData.join()}
    `;

    await prisma.$executeRawUnsafe(insertQuery);
  }
}

export default VitalsWatcher;
