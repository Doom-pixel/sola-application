import { Transaction, VersionedTransaction } from '@solana/web3.js';

const BASE58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function bytesToBase64(value: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value).toString('base64');
  }

  let binary = '';
  value.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export function base64ToBytes(value: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(value, 'base64'));
  }
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

export function getSignMessageBytes(
  data: string | Record<string, unknown> | undefined
): Uint8Array {
  if (typeof data === 'string') {
    if (!data) {
      throw new Error('Blink did not return a message to sign');
    }
    return base64ToBytes(data);
  }

  if (data && typeof data === 'object') {
    return new TextEncoder().encode(JSON.stringify(data));
  }

  throw new Error('Blink did not return a message to sign');
}

export function encodeBase58(bytes: Uint8Array): string {
  if (!bytes.length) return '';

  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) {
    zeros += 1;
  }

  const size = Math.ceil(bytes.length * 1.38) + 1;
  const encoded = new Uint8Array(size);
  let length = 0;

  for (let i = zeros; i < bytes.length; i += 1) {
    let carry = bytes[i];
    let j = 0;
    for (
      let k = size - 1;
      (carry !== 0 || j < length) && k >= 0;
      k -= 1, j += 1
    ) {
      carry += encoded[k] * 256;
      encoded[k] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    length = j;
  }

  let start = size - length;
  while (start < size && encoded[start] === 0) {
    start += 1;
  }

  let result = '1'.repeat(zeros);
  for (let i = start; i < size; i += 1) {
    result += BASE58_ALPHABET[encoded[i]];
  }
  return result;
}

export function deserializeTransaction(transaction: string) {
  const buffer = base64ToBytes(transaction);

  try {
    return VersionedTransaction.deserialize(buffer);
  } catch {
    return Transaction.from(buffer);
  }
}

export const SOLANA_ADDRESS_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function isSolanaAddress(value: string): boolean {
  return SOLANA_ADDRESS_RE.test(value);
}
