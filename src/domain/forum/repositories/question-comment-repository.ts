import { PaginationParams } from '@/shared/repositories/pagination-params';
import { QuestionComment } from '../entities/comment';

export interface QuestionCommentRepository {
  create(comment: QuestionComment): Promise<void>;
  findManyByQuestionId(
    params: PaginationParams,
    questionId: string,
  ): Promise<QuestionComment[]>;
  findById(id: string): Promise<QuestionComment | null>;
  delete(comment: QuestionComment): Promise<void>;
}
