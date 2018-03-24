let ethUtil = require("ethereumjs-util");

/**
 * Creates a signature string based on the given raw input by hashing the input and then calculating
 * a Keccak/SHA3 signature with the given private key.
 * @param {Buffer|Array|String|Number} inputMsg The raw input.
 * @param {String} privateKey The private key with which the input message shall be signed.
 * @returns {String} The signature in Ethereums rpc format as a string.
 */
function createSignature(inputMsg, privateKey) {
  let privateKeyBuffer = ethUtil.toBuffer(privateKey);
  let inputHash = ethUtil.sha256(inputMsg);
  let signature = ethUtil.ecsign(inputHash, privateKeyBuffer);
  return ethUtil.toRpcSig(signature.v, signature.r, signature.s);
}

/**
 * Validates the given signature if it's signed by the expected sender/address.
 * @param {Buffer|Array|String|Number} inputMsg The raw input message. Will be hashed via SHA256 internally.
 * @param {String} signature The signature string in Ethereums rpc format.
 * @param {String} expectedAddress The expected Ethereum address by whom (aka with its private key) the message was signed.
 * @returns {boolean} True only if the signature is valid and issued by the given address.
 */
function verifySignature(inputMsg, signature, expectedAddress) {
  let r = ethUtil.toBuffer(signature.slice(0, 66));
  let s = ethUtil.toBuffer('0x' + signature.slice(66, 130));
  let v = ethUtil.bufferToInt(ethUtil.toBuffer('0x' + signature.slice(130, 132))) + 27;
  let inputHash = ethUtil.sha256(inputMsg);
  let m = ethUtil.toBuffer(inputHash);
  let pub = ethUtil.ecrecover(m, v, r, s);
  let adr = '0x' + ethUtil.pubToAddress(pub).toString('hex');
  return adr === expectedAddress;
}

module.exports = {
  createSignature: createSignature,
  verifySignature: verifySignature
};
