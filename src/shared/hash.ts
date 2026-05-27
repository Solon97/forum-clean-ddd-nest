import { hash, compare, genSalt } from 'bcryptjs';
import * as crypto from 'crypto';

export async function hashValue(value: string): Promise<string> {
  const preHash = crypto.createHash('sha256').update(value).digest('hex');

  const salt = await genSalt(10);
  return hash(preHash, salt);
}

export async function compareHashValue(
  value: string,
  hash: string,
): Promise<boolean> {
  const preHash = crypto.createHash('sha256').update(value).digest('hex');
  return compare(preHash, hash);
}
