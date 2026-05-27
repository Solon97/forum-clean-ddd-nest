import { Answer } from '@/domain/forum/entities/answer';
import { AnswerRepository } from '@/domain/forum/repositories/answer-repository';

export class InMemoryAnswerRepository implements AnswerRepository {
  private items: Answer[] = [];

  async create(answer: Answer): Promise<void> {
    this.items.push(answer);
    return Promise.resolve();
  }

  async update(answer: Answer): Promise<void> {
    const index = this.items.findIndex(
      (item) => item.id.value === answer.id.value,
    );
    if (index !== -1) {
      this.items[index] = answer;
    }
    return Promise.resolve();
  }

  async findById(id: string): Promise<Answer | null> {
    const answer = this.items.find((item) => item.id.value === id);
    return Promise.resolve(answer || null);
  }

  async findManyByQuestionId(): Promise<Answer[]> {
    return Promise.resolve(this.items);
  }

  async delete(answer: Answer): Promise<void> {
    const index = this.items.findIndex(
      (item) => item.id.value === answer.id.value,
    );
    if (index !== -1) {
      this.items.splice(index, 1);
    }
    return Promise.resolve();
  }
}
