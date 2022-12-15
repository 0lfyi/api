import { parse } from "graphql";

export default parse(`
  enum VMStatus {
    Executed
    OutOfGas
    MoveAbort
    ExecutionFailure
    MiscellaneousError
    VerificationError
    DeserializationError
    PublishingFailure
    Unknown
  }
  enum TransactionType {
    BlockMetadata
    User
    WriteSet
    Unknown
  }
  type Transaction {
    hash: ID!
    gasUsed: BigInt 
    vmStatus: VMStatus
    type: TransactionType
    events: [Event!]
  }
`);
