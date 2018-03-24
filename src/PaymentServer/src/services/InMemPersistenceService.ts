import { PersistenceService } from "./PersistenceService";

export class InMemPersistenceService implements PersistenceService {

  private storage: any = {};

  async store(tableName: string, key: string, obj: any): Promise<void> {
    if (!this.storage[tableName]) {
      this.storage[tableName] = {};
    }
    this.storage[tableName][key] = obj;
  }

  async del(tableName: string, key: string): Promise<void> {
    if (!this.storage[tableName]) {
      return;
    }
    delete this.storage[tableName][key];
  }

  async load(tableName: string, key: string): Promise<any> {
    if (!this.storage[tableName]) {
      return undefined;
    }
    return this.storage[tableName][key];
  }

  async increment(tableName: string, key: string) {
    let num = await this.load(tableName, key);
    if (!num) {
      num = 0;
    }
    num += 1;
    await this.store(tableName, key, num);
    return num;
  }

  async loadTable(tableName: string): Promise<{ [p: string]: Object }> {
    return this.storage[tableName];
  }

  async loadTableKeys(tableName: string): Promise<string[]> {
    if (!this.storage[tableName]) {
      return [];
    }
    return Object.keys(this.storage[tableName]);
  }
}
