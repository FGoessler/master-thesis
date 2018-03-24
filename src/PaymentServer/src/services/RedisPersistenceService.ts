import { RedisClient } from "redis";
import { PersistenceService } from "./PersistenceService";

export class RedisPersistenceService implements PersistenceService {
  private redisClient: RedisClient;

  constructor(_redisClient: RedisClient) {
    this.redisClient = _redisClient;
  }

  async store(tableName: string, key: string, obj: any) {
    const value = JSON.stringify(obj);
    const id = Math.random();
    console.time("REDIS_STORE_" + id);
    return await new Promise<void>((resolve, reject) => {
      this.redisClient.hset(tableName, key, value, (err) => {
        console.timeEnd("REDIS_STORE_" + id);
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async increment(tableName: string, key: string) {
    const id = Math.random();
    console.time("REDIS_HINCR_" + id);
    return await new Promise<number>((resolve, reject) => {
      this.redisClient.hincrby(tableName, key, 1, (err, res) => {
        console.timeEnd("REDIS_HINCR_" + id);
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  async del(tableName: string, key: string) {
    return await new Promise<void>((resolve, reject) => {
      this.redisClient.hdel(tableName, key, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async load(tableName: string, key: string) {
    // const id = Math.random();
    // console.time("REDIS_HGET_" + id);
    const value = await new Promise<string>((resolve, reject) => {
      this.redisClient.hget(tableName, key, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
    // console.timeEnd("REDIS_HGET_" + id);
    if (value) {
      return JSON.parse(value);
    } else {
      return undefined;
    }
  }

  async loadTable(tableName: string) {
    const result = await new Promise<{ [key: string]: string }>((resolve, reject) => {
      this.redisClient.hgetall(tableName, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
    const transformedResult: { [key: string]: object } = {};
    for (const key of Object.keys(result)) {
      transformedResult[key] = JSON.parse(result[key]);
    }
    return transformedResult;
  }

  async loadTableKeys(tableName: string) {
    return await new Promise<string[]>((resolve, reject) => {
      this.redisClient.hkeys(tableName, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }
}
