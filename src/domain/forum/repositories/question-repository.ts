import { PaginationParams } from '@/shared/repositories/pagination-params';
import { Question } from '../entities/question';

export interface QuestionRepository {
  create(question: Question): Promise<void>;
  update(question: Question): Promise<void>;
  findBySlug(slug: string): Promise<Question | null>;
  findManyRecent(params: PaginationParams): Promise<Question[]>;
  findById(id: string): Promise<Question | null>;
  delete(question: Question): Promise<void>;
}
