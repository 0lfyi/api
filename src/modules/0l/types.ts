interface TransactionDataView_User {
  type: 'user';
  sender: string;
  signature_scheme: string,
  signature: string,
  public_key: string,
  secondary_signers?: string[];
  secondary_signature_schemes?: string[];
  secondary_signatures?: string[];
  secondary_public_keys?: string[]; 
  sequence_number: number;
  chain_id: number;
  max_gas_amount: number;
  gas_unit_price: number;
  gas_currency: string;
  expiration_timestamp_secs: number;
  script_hash: string;
  script_bytes: string;
  script: string;
}

interface TransactionDataView_BlockMetadata {
  type: 'blockmetadata';
  timestamp_usecs: number;
}

interface TransactionDataView_WriteSet {
  type: 'writeset';
}

interface TransactionDataView_Unknown{
  type: 'unknown';
}

type TransactionDataView =
  | TransactionDataView_BlockMetadata
  | TransactionDataView_User
  | TransactionDataView_WriteSet
  | TransactionDataView_Unknown;

interface VMStatusView_Executed {
  type: 'executed';
}

interface VMStatusView_OutOfGas {
  type: 'out_of_gas';
}

interface VMStatusView_MoveAbort {
  type: 'move_abort';
  location: string,
  abort_code: number,
  //explanation: Option<MoveAbortExplanationView>,
};

interface VMStatusView_ExecutionFailure {
  type: 'execution_failure';
  location: string;
  function_index: number;
  code_offset: number;
};

interface VMStatusView_MiscellaneousError {
  type: 'miscellaneous_error'
}

interface VMStatusView_VerificationError {
  type: 'verification_error',
}

interface VMStatusView_DeserializationError {
  type: 'deserialization_error',
}

interface VMStatusView_PublishingFailure {
  type: 'publishing_failure',
}

interface VMStatusView_Unknown {
  type: 'unknown'
}

type VMStatusView =
  | VMStatusView_Executed
  | VMStatusView_OutOfGas
  | VMStatusView_MoveAbort
  | VMStatusView_ExecutionFailure
  | VMStatusView_MiscellaneousError
  | VMStatusView_VerificationError
  | VMStatusView_DeserializationError
  | VMStatusView_PublishingFailure
  | VMStatusView_Unknown;

export interface TransactionView {
  version: number;
  transaction: TransactionDataView;
  vm_status: VMStatusView;
  hash: string;
  bytes: string;
  gas_used: number;
  events?: EventView[];
}

interface AmountView {
  amount: number;
  currency: string;
}

interface EventDataView_Burn {
  type: "burn";
  amount: AmountView;
  preburn_address: string;
}

interface EventDataView_CancelBurn {
  type: "cancelburn";
  // amount: AmountView,
  // preburn_address: AccountAddress,
}

interface EventDataView_Mint {
  type: "mint";
  amount: AmountView
}

interface EventDataView_ToXDXExchangeRateUpdate {
  type: "to_xdx_exchange_rate_update";
  // currency_code: String,
  // new_to_xdx_exchange_rate: f32,
}

interface EventDataView_Preburn {
  type: "preburn";
  // amount: AmountView,
  // preburn_address: AccountAddress,
}

interface EventDataView_ReceivedPayment {
  type: "receivedpayment";
  amount: AmountView,
  receiver: string;
  sender: string;
  metadata: string;
}

interface EventDataView_SentPayment {
  type: "sentpayment";
  amount: AmountView,
  receiver: string;
  sender: string;
  metadata: string;
}

interface EventDataView_AdminTransaction {
  type: "admintransaction";
  // committed_timestamp_secs: u64
}

interface EventDataView_NewEpoch {
  type: "newepoch";
  epoch: number;
}

interface EventDataView_NewBlock {
  type: "newblock";
  round: number;
  proposer: string;
  proposed_time: number;
}

interface EventDataView_ReceivedMint {
  type: "receivedmint";
  // amount: AmountView,
  // destination_address: AccountAddress,
}

interface EventDataView_ComplianceKeyRotation {
  type: "compliancekeyrotation";
  // time_rotated_seconds: u64,
}

interface EventDataView_BaseUrlRotation {
  type: "baseurlrotation";
  // new_base_url: String,
  // time_rotated_seconds: u64,
}

interface EventDataView_CreateAccount {
  type: "createaccount";
  created_address: string;
  role_id: number;
}

interface EventDataView_DiemIdDomain {
  type: "diemiddomain";

  // Whether a domain was added or removed
  // removed: bool,

  // Diem ID Domain string of the account
  // domain: DiemIdVaspDomainIdentifier,

  // On-chain account address
  // address: AccountAddress,
}

interface EventDataView_Unknown {
  type: "unknown";
  // bytes: Option<BytesView>;
}

type EventDataView = 
  | EventDataView_Burn
  | EventDataView_CancelBurn
  | EventDataView_Mint
  | EventDataView_ToXDXExchangeRateUpdate
  | EventDataView_Preburn
  | EventDataView_ReceivedPayment
  | EventDataView_SentPayment
  | EventDataView_AdminTransaction
  | EventDataView_NewEpoch
  | EventDataView_NewBlock
  | EventDataView_ReceivedMint
  | EventDataView_ComplianceKeyRotation
  | EventDataView_BaseUrlRotation
  | EventDataView_CreateAccount
  | EventDataView_DiemIdDomain
  | EventDataView_Unknown;

export interface EventView {
  key: string;
  sequence_number: number;
  transaction_version: number;
  data: EventDataView;
}

interface AccountRoleView_ChildVASP {
  type: 'child_vasp';
}

interface AccountRoleView_ParentVASP {
  type: 'parent_vasp';
  human_name: string;
  base_url: string;
  expiration_time: number;
  compliance_key: string;
  num_children: number;
  compliance_key_rotation_events_key: string;
  base_url_rotation_events_key: string;
  // diem_id_domains: Option<Vec<DiemIdVaspDomainIdentifier>>,
}

interface AccountRoleView_DesignatedDealer {
  type: 'designated_dealer';
  human_name: string;
  base_url: string;
  expiration_time: number;
  compliance_key: string;
  preburn_balances: AmountView[];
  received_mint_events_key: string;
  compliance_key_rotation_events_key: string;
  base_url_rotation_events_key: string;
  // preburn_queues: Option<Vec<PreburnQueueView>>,
}

interface AccountRoleView_TreasuryCompliance {
  type: 'treasury_compliance';
  diem_id_domain_events_key?: string;
}

interface AccountRoleView_Unknown {
  type: 'unknown';
}

type AccountRoleView =
  | AccountRoleView_ChildVASP
  | AccountRoleView_ParentVASP
  | AccountRoleView_DesignatedDealer
  | AccountRoleView_TreasuryCompliance
  | AccountRoleView_Unknown; 

export interface AccountView {
  address: string;
  balances: AmountView[];
  sequence_number: number;
  authentication_key: string;
  sent_events_key: string;
  received_events_key: string;
  delegated_key_rotation_capability: boolean;
  delegated_withdrawal_capability: boolean;
  is_frozen: boolean;
  role: AccountRoleView;
  version: number;
}