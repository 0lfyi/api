import type { AccountView, TransactionView } from './types.js';

interface JSONRpcResponse<R> {
  jsonrpc: string;
  id: number;
  result: R;
}

interface DiemRpcResponse<R> extends JSONRpcResponse<R> {
  diem_chain_id: number;
  diem_ledger_version: number;
  diem_ledger_timestampusec: number;
}

interface RawCurrencyInfo {
  code: string;
  fractional_part: number;
  scaling_factor: number;
  to_xdx_exchange_rate: number;
  mint_events_key: string;
  burn_events_key: string;
  preburn_events_key: string;
  cancel_burn_events_key: string;
  exchange_rate_update_events_key: string;
}

interface CurrencyInfo {
  code: string;
  fractionalPart: number;
  scalingFactor: number;
  toXDXExchangeRate: number;
  mintEventsKey: string;
  burnEventsKey: string;
  preburnEventsKey: string;
  cancelBurnEventsKey: string;
  exchangeRateUpdateEventsKey: string;
}

interface RawMetadata {
  version: number;
  accumulator_root_hash: string;
  timestamp: number;
  chain_id: number;
  script_hash_allow_list: string[] | null;
  module_publishing_allowed: boolean | null;
  diem_version: number | null;
  dual_attestation_limit: number | null;
}

interface Metadata {
  version: number;
  accumulatorRootHash: Buffer;
  timestamp: number;
  chainId: number;
  scriptHashAllowList?: Buffer[];
  modulePublishingAllowed?: boolean;
  diemVersion?: number;
  dualAttestationLimit?: number;
}

interface ScriptView {
  type: string;
  arguments_bcs: string[];
}

interface TransactionDataView_BlockMetadata {
  type: 'blockmetadata';
  timestamp_usecs: number;
}

interface TransactionDataView_WriteSet {
  type: 'writeset';
}

interface TransactionDataView_User {
  type: 'user';
  sender: string;
  signature_scheme: string;
  signature: string;
  public_key: string;
  secondary_signers: string[];
  secondary_signature_schemes: string[];
  secondary_signatures: string[];
  secondary_public_keys: string[];
  sequence_number: number;
  chain_id: number;
  max_gas_amount: number;
  gas_unit_price: number;
  gas_currency: string;
  expiration_timestamp_secs: number;
  script_hash: string;
  script_bytes: string;
  script: [Object];
}

type TransactionDataView = TransactionDataView_BlockMetadata | TransactionDataView_WriteSet;

interface RawTransaction {
  version: number;
  hash: string;
  transaction: TransactionDataView;
}

class Provider {
  private url: string;

  public constructor(url: string) {
    this.url = url;
  }

  public async getCurrencies(): Promise<CurrencyInfo[]> {
    const res = await this.invoke<RawCurrencyInfo[]>('get_currencies', []);

    return res.result.map((info) => ({
      code: info.code,
      fractionalPart: info.fractional_part,
      scalingFactor: info.scaling_factor,
      toXDXExchangeRate: info.to_xdx_exchange_rate,
      mintEventsKey: info.mint_events_key,
      burnEventsKey: info.burn_events_key,
      preburnEventsKey: info.preburn_events_key,
      cancelBurnEventsKey: info.cancel_burn_events_key,
      exchangeRateUpdateEventsKey: info.exchange_rate_update_events_key,
    }));
  }

  public async getMetadata(version?: number): Promise<Metadata | undefined> {
    const params = version === undefined ? [] : [version];
    const res = await this.invoke<RawMetadata>('get_metadata', params);

    const rawMetadata = res.result;
    if (!rawMetadata) {
      return;
    }

    return {
      version: rawMetadata.version,
      accumulatorRootHash: Buffer.from(rawMetadata.accumulator_root_hash, 'hex'),
      timestamp: rawMetadata.timestamp,
      chainId: rawMetadata.chain_id,
      scriptHashAllowList: rawMetadata.script_hash_allow_list
        ? rawMetadata.script_hash_allow_list.map((it) => Buffer.from(it, 'hex'))
        : undefined,
      modulePublishingAllowed:
        rawMetadata.module_publishing_allowed !== null
          ? rawMetadata.module_publishing_allowed
          : undefined,
      diemVersion: rawMetadata.diem_version !== null ? rawMetadata.diem_version : undefined,
      dualAttestationLimit:
        rawMetadata.dual_attestation_limit !== null
          ? rawMetadata.dual_attestation_limit
          : undefined,
    };
  }

  public async getAccount(address: string, version?: number): Promise<AccountView> {
    const res = await this.invoke<AccountView>(
      'get_account',
      version === undefined ? [address] : [address, version]
    );
    return res.result;
  }

  public async getTransactions(
    startVersion: number,
    limit: number,
    includeEvents: boolean
  ): Promise<TransactionView[]> {
    const res = await this.invoke<TransactionView[]>('get_transactions', [
      startVersion,
      limit,
      includeEvents,
    ]);
    return res.result;
  }

  public async getTransactionsWithProofs(
    startVersion: number,
    limit: number,
    includeEvents: boolean
  ): Promise<any[]> {
    const res = await this.invoke<any[]>('get_transactions_with_proofs', [
      startVersion,
      limit,
      includeEvents,
    ]);
    return res.result;
  }

  public async invoke<R>(method: string, params: unknown[]): Promise<DiemRpcResponse<R>> {
    const res = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: 1,
      }),
    });
    return await res.json();
  }
}

export default Provider;
