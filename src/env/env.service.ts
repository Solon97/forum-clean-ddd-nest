import { ConfigService } from '@nestjs/config';
import { Env } from './env';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EnvConfigService extends ConfigService<Env, true> {
  constructor() {
    super();
  }

  get<K extends keyof Env>(key: K): Env[K] {
    return super.get(key, {
      infer: true,
    });
  }
}
