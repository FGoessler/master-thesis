
export interface Config {
  port: number;
  ethNodeUrl: string;
  enforceSignedIncomingRequests: boolean;
  persistence: PersistenceConfig;
  mediator: MediatorConfig;
}

export interface PersistenceConfig {
  type: string;
  redisConfig: any;
}

export interface MediatorConfig {
  transactionRetryInterval: number;
  transactionMaxRetryCount: number;
}
