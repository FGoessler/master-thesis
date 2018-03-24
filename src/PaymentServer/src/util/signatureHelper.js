let ethUtil = require("ethereumjs-util");
var abi = require('ethereumjs-abi');

/**
 * Creates a hash as solidity would. Use this method to create a hash that will also
 * be checked eventually inside a smart contract.
 * For more info see the documentation of ethereumjs-abi for the soliditySHA256 method.
 */
function solidityHash(types, values) {
  return abi.soliditySHA256(types, values);
}

/**
 * Creates a simple sha256 hash based on the input. Not suited for checks inside a solidity contract.
 */
function simpleHash(input) {
  return ethUtil.sha256(input);
}

/**
 * Creates a signature string based on the given input hash by calculating a Keccak/SHA3 signature
 * with the given private key.
 * @param {Buffer} hash The hash of the signed input.
 * @param {String} privateKey The private key with which the input message shall be signed.
 * @returns {String} The signature in Ethereums rpc format as a string.
 */
function createSignature(hash, privateKey) {
  let privateKeyBuffer = ethUtil.toBuffer(privateKey);
  let signature = ethUtil.ecsign(hash, privateKeyBuffer);
  return ethUtil.toRpcSig(signature.v, signature.r, signature.s);
}

/**
 * Validates the given signature if it's signed by the expected sender/address.
 * @param {Buffer} hash The hash of the signed input.
 * @param {String} signature The signature string in Ethereums rpc format.
 * @param {String} expectedAddress The expected Ethereum address by whom (aka with its private key) the message was signed.
 * @returns {boolean} True only if the signature is valid and issued by the given address.
 */
function verifySignature(hash, signature, expectedAddress) {
  let r = ethUtil.toBuffer(signature.slice(0, 66));
  let s = ethUtil.toBuffer('0x' + signature.slice(66, 130));
  let v = ethUtil.bufferToInt(ethUtil.toBuffer('0x' + signature.slice(130, 132))) + 27;
  let m = ethUtil.toBuffer(hash);
  let pub = ethUtil.ecrecover(m, v, r, s);
  let adr = '0x' + ethUtil.pubToAddress(pub).toString('hex');
  return adr === expectedAddress;
}

module.exports = {
  solidityHash: solidityHash,
  simpleHash: simpleHash,
  createSignature: createSignature,
  verifySignature: verifySignature
};
