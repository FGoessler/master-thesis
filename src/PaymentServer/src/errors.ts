
import { Address } from "cluster";
export class PaymentServerError extends Error {
  public httpStatusCode: number;
  public underlyingError: any;
  public code: any;
  public metadata: any;

  constructor(code: number, message: string, underlyingError?: Error) {
    super(message);
    this.name = "PaymentServerError";
    this.code = code;
    this.underlyingError = underlyingError;
    this.metadata = {};
    this.httpStatusCode = 412;
  }

  toObject(): any {
    const obj = {
      name: this.name,
      code: this.code,
      message: this.message,
      metadata: undefined,
      underlyingError: {}
    };

    if (Object.keys(this.metadata).length > 0) {
      obj.metadata = this.metadata;
    }

    if (this.underlyingError) {
      if (this.underlyingError instanceof PaymentServerError) {
        obj.underlyingError = this.underlyingError.toObject();
      } else {
        obj.underlyingError = {
          name: this.underlyingError.name,
          message: this.underlyingError.message,
          stack: this.underlyingError.stack
        };
      }
    }

    return obj;
  }
}

export class MediatorTerminatedError extends PaymentServerError {
  constructor(mediatorAddress: Address | string) {
    super(1, "The mediator is already terminated and cannot execute the request anymore.");
    this.metadata.mediatorAddress = mediatorAddress;
  }
}

export class InvalidActorError extends PaymentServerError {
  constructor() {
    super(2, "The sender of the request is not allowed to perform this action. E.g. he is the consuming service and the action is only permitted by the providing service.");
  }
}

export class SignatureInvalidError extends PaymentServerError {
  constructor() {
    super(4, "Signature invalid");
  }
}

export class InvalidTokenError extends PaymentServerError {
  constructor(underlyingError: PaymentServerError) {
    super(underlyingError.code, "The provided token was checked and not found valid.", underlyingError);
  }
}

export class InvalidTokenIDError extends PaymentServerError {
  constructor(tokenID: string) {
    super(36, "Invalid token ID");
    this.metadata.tokenID = tokenID;
  }
}

export class InvalidRequestCountError extends PaymentServerError {
  constructor(actualCount: number) {
    super(37, "Request count too low!");
    this.metadata.actualCount = actualCount;
  }
}

export class MediatorSettingsNotMatchingProviderRequirementsError extends PaymentServerError {
  constructor() {
    super(38, "The mediator settings (e.g. costPerRequest and timeout durations) to NOT match the requirements of the providing service!");
  }
}

export class NoTokenRedemptionActiveError extends PaymentServerError {
  constructor(actualCount: number) {
    super(39, "No token redemption is active right now. Start a token redemption first. This error might also occur if you try to finalize an already finalized token redemption.");
    this.metadata.actualCount = actualCount;
  }
}

export class TokenRedemptionTimeoutNotFinishedError extends PaymentServerError {
  constructor(timeoutAt: number, now: number) {
    super(30, "The token redemption timeout did not pass yet. Please wait to redeem the token. If using docker please check if the container's timestamp is correct and restart docker otherwise (see: https://forums.docker.com/t/time-in-container-is-out-of-sync).");
    this.metadata.timeoutAt = timeoutAt;
    this.metadata.now = now;
  }
}

export class TokenIDInActiveUseError extends PaymentServerError {
  constructor() {
    super(31, "The provided token ID is currently used and cannot be used as new token ID.");
  }
}

export class TokenRedemptionInProgressError extends PaymentServerError {
  constructor() {
    super(32, "Another token redemption is in progress because of which a new redemption cannot be started yet.");
  }
}

export class TokenIDAlreadyUsedOnceError extends PaymentServerError {
  constructor() {
    super(33, "The provided token ID was already used in the past and cannot be used as new token ID.");
  }
}

export class InsufficientConsumerFundsError extends PaymentServerError {
  constructor() {
    super(34, "The consumer does not have enough funds in the contract to pay for this token.");
  }
}

export class TerminationNotYetStartedError extends PaymentServerError {
  constructor() {
    super(40, "Termination cannot be finalized before being started.");
  }
}

export class TerminationTimeoutNotFinishedError extends PaymentServerError {
  constructor(timeoutAt: number, now: number) {
    super(41, "The termination timeout did not pass yet. Please wait to finalize the termination. If using docker please check if the container's timestamp is correct and restart docker otherwise (see: https://forums.docker.com/t/time-in-container-is-out-of-sync).");
    this.metadata.timeoutAt = timeoutAt;
    this.metadata.now = now;
  }
}

export class MediatorDeploymentError extends PaymentServerError {
  constructor(underlyingError: Error) {
    super(50, "Could not deploy mediator.", underlyingError);
  }
}

export class DepositError extends PaymentServerError {
  constructor(underlyingError: Error) {
    super(60, "Could not deposit funds to mediator.", underlyingError);
  }
}

export class TransactionValidationError extends PaymentServerError {
  constructor(underlyingError: Error) {
    super(100, "Ethereum transaction could not be executed or validated.", underlyingError);
    this.httpStatusCode = 500;
  }
}

export class EthereumCommunicationError extends PaymentServerError {
  constructor(underlyingError: Error, context: any) {
    super(101, "Error while communicating with the ethereum node via web3.js.", underlyingError);
    this.metadata.context = context;
    this.httpStatusCode = 500;
  }
}

export class RequestSignatureInvalidError extends PaymentServerError {
  constructor(endpoint: string) {
    super(200, "Request to payment server included an invalid signature. The request might have been modified during transmission.");
    this.metadata.endpoint = endpoint;
  }
}

export class MissingSignatureError extends PaymentServerError {
  constructor(endpoint: string) {
    super(201, "Request to payment server did not include a valid signature header field (x-pay-signature).");
    this.metadata.endpoint = endpoint;
  }
}

export class MissingSenderError extends PaymentServerError {
  constructor(endpoint: string) {
    super(202, "Request to payment server did not include a valid sender header field (x-pay-sender).");
    this.metadata.endpoint = endpoint;
  }
}

export class UnknownError extends PaymentServerError {
  constructor(code: number, underlyingError?: Error) {
    super(code, "An unknown error occurred.", underlyingError);
    this.httpStatusCode = 500;
  }
}

export function getErrorForCode(code: number): Error {
  const errClasses: any = {
    1: MediatorTerminatedError,
    2: InvalidActorError,
    3: InvalidActorError,
    4: SignatureInvalidError,
    30: TokenRedemptionTimeoutNotFinishedError,
    31: TokenIDInActiveUseError,
    32: TokenRedemptionInProgressError,
    33: TokenIDAlreadyUsedOnceError,
    34: InsufficientConsumerFundsError,
    36: InvalidTokenIDError,
    37: InvalidRequestCountError,
    38: MediatorSettingsNotMatchingProviderRequirementsError,
    39: NoTokenRedemptionActiveError,
    40: TerminationNotYetStartedError,
    41: TerminationTimeoutNotFinishedError,
    50: MediatorDeploymentError,
    60: DepositError,
    100: TransactionValidationError,
    101: EthereumCommunicationError,
    200: RequestSignatureInvalidError,
    201: MissingSignatureError,
    202: MissingSenderError
  };
  return new errClasses[code];
}
