
export default class Logger {
  static log(msg: string) {
    console.log(`[${(new Date()).toLocaleTimeString()}] ${msg}`);
  }

  static warn(msg: string) {
    console.warn(`[${(new Date()).toLocaleTimeString()}] ${msg}`);
  }

  static error(msg: string) {
    console.error(`[${(new Date()).toLocaleTimeString()}] ${msg}`);
  }
}
