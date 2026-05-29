import { Hasher } from '@/domain/forum/gateways/hasher';
import { Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcryptjs';

@Injectable()
export class BcryptHasher implements Hasher {
  async hash(value: string): Promise<string> {
    const salt = await genSalt(10);
    return hash(value, salt);
  }

  async compare(value: string, hashValue: string): Promise<boolean> {
    return compare(value, hashValue);
  }
}
