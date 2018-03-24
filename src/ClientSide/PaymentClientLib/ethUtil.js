const _ = require("lodash");
const BigNumber = require('bignumber.js');

const unitMap = {
  'wei':          '1',
  'kwei':         '1000',
  'ada':          '1000',
  'femtoether':   '1000',
  'mwei':         '1000000',
  'babbage':      '1000000',
  'picoether':    '1000000',
  'gwei':         '1000000000',
  'shannon':      '1000000000',
  'nanoether':    '1000000000',
  'nano':         '1000000000',
  'szabo':        '1000000000000',
  'microether':   '1000000000000',
  'micro':        '1000000000000',
  'finney':       '1000000000000000',
  'milliether':   '1000000000000000',
  'milli':        '1000000000000000',
  'ether':        '1000000000000000000',
  'kether':       '1000000000000000000000',
  'grand':        '1000000000000000000000',
  'einstein':     '1000000000000000000000',
  'mether':       '1000000000000000000000000',
  'gether':       '1000000000000000000000000000',
  'tether':       '1000000000000000000000000000000'
};

function getValueOfUnit(unit) {
  unit = unit ? unit.toLowerCase() : 'ether';
  let unitValue = unitMap[unit];
  if (!unitValue) {
    throw new Error('Unit does not exist. Possible units: ' + JSON.stringify(unitMap));
  }
  return new BigNumber(unitValue, 10);
}

function toWei(number, unit) {
  return toBigNumber(number).times(getValueOfUnit(unit));
}

function fromWei(number, unit) {
  return toBigNumber(number).dividedBy(getValueOfUnit(unit));
}

function toBigNumber(number) {
  number = number || 0;
  if (isBigNumber(number)) {
    return number;
  }

  if (_.isString(number) && (number.indexOf('0x') === 0 || number.indexOf('-0x') === 0)) {
    return new BigNumber(number.replace('0x',''), 16);
  }

  return new BigNumber(number.toString(10), 10);
}

function isBigNumber(object) {
  return object instanceof BigNumber;
}

module.exports = {
  fromWei: fromWei,
  toWei: toWei,
  toBigNumber: toBigNumber
};
