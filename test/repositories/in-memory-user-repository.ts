import { User } from '@/domain/forum/entities/user';
import { UserRepository } from '@/domain/forum/repositories/user-repository';

export class InMemoryUserRepository implements UserRepository {
  public items: User[] = [];

  async create(user: User): Promise<void> {
    this.items.push(user);
    return Promise.resolve();
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((item) => item.email === email);
    return Promise.resolve(user ?? null);
  }
}
