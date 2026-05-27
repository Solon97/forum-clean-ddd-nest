import { PaginationParams } from '@/shared/repositories/pagination-params';
import type { Answer } from '../entities/answer';

export interface AnswerRepository {
  create(answer: Answer): Promise<void>;
  update(answer: Answer): Promise<void>;
  findById(id: string): Promise<Answer | null>;
  findManyByQuestionId(
    params: PaginationParams,
    questionId: string,
  ): Promise<Answer[]>;
  delete(answer: Answer): Promise<void>;
}
