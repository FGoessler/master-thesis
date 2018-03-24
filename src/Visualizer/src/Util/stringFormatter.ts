
export default class StringFormatter {
  static trimHash(hash: string, length: number = 19) {
    if (!hash || hash.length <= length) {
      return hash;
    }

    const charsToShow = length - 3;
    const front = Math.ceil(charsToShow / 2.0);
    const back = Math.floor(charsToShow / 2.0);

    return `${hash.substr(0, front)}...${hash.substr(hash.length - back)}`;
  }
}
