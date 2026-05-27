import { PaginationParams } from '@/shared/repositories/pagination-params';
import { AnswerComment } from '../entities/comment';

export interface AnswerCommentRepository {
  create(comment: AnswerComment): Promise<void>;
  findManyByAnswerId(
    params: PaginationParams,
    answerId: string,
  ): Promise<AnswerComment[]>;
  findById(id: string): Promise<AnswerComment | null>;
  delete(comment: AnswerComment): Promise<void>;
}
