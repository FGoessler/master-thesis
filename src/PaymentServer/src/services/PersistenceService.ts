
export interface PersistenceService {
  store(tableName: string, key: string, obj: any): Promise<void>;
  del(tableName: string, key: string): Promise<void>;
  increment(tableName: string, key: string): Promise<number>;
  load(tableName: string, key: string): Promise<any>;
  loadTable(tableName: string): Promise<{ [key: string]: object }>;
  loadTableKeys(tableName: string): Promise<string[]>;
}

export type EthAddress = string;
