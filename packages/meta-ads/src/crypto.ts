import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;
const TAG_LEN = 16;

function loadKey(masterKeyB64: string): Buffer {
  const key = Buffer.from(masterKeyB64, 'base64');
  if (key.length !== 32) {
    throw new Error(`META_MASTER_KEY must be 32 bytes (base64). Got ${key.length} bytes.`);
  }
  return key;
}

/** Encrypts a token and returns base64(iv || ciphertext || authTag). */
export function encryptToken(plaintext: string, masterKeyB64: string): string {
  const key = loadKey(masterKeyB64);
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, ct, tag]).toString('base64');
}

/** Decrypts base64(iv || ciphertext || authTag) back to the original token. */
export function decryptToken(encryptedB64: string, masterKeyB64: string): string {
  const key = loadKey(masterKeyB64);
  const buf = Buffer.from(encryptedB64, 'base64');
  if (buf.length < IV_LEN + TAG_LEN + 1) {
    throw new Error('Encrypted payload too short.');
  }
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(buf.length - TAG_LEN);
  const ct = buf.subarray(IV_LEN, buf.length - TAG_LEN);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

/** Generates a fresh 32-byte master key, base64-encoded. Use once for setup. */
export function generateMasterKey(): string {
  return randomBytes(32).toString('base64');
}
