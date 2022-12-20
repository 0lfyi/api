import { Point } from '@influxdata/influxdb-client';
import EventSource from 'eventsource';
import { writeApi } from '../../services/influxdb.js';
import rootLogger from '../../logger.js';
import config from '../../config.js';

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
    validator_view: {
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
    }[];
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

    for (const it of message.chain_view.validator_view) {
      for (const metric of metrics) {
        const point = new Point(metric);
        point.tag('account_address', it.account_address);
        point.tag('vfn_ip', it.vfn_ip);
        point.tag('validator_ip', it.validator_ip);
        point.floatField('value', (it as any)[metric] as number);
        points.push(point);
      }
    }

    writeApi.writePoints(points);
    await writeApi.flush();
  }
}

export default VitalsWatcher;
