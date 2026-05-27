import { AnswerComment } from '@/domain/forum/entities/comment';
import { AnswerCommentRepository } from '@/domain/forum/repositories/answer-comment-repository';
import { PaginationParams } from '@/shared/repositories/pagination-params';

export class InMemoryAnswerCommentRepository implements AnswerCommentRepository {
  private items: AnswerComment[] = [];

  create(comment: AnswerComment): Promise<void> {
    this.items.push(comment);
    return Promise.resolve();
  }

  findManyByAnswerId(
    params: PaginationParams,
    answerId: string,
  ): Promise<AnswerComment[]> {
    const comments = this.items
      .filter((comment) => comment.answerId.toString() === answerId)
      .slice((params.page - 1) * 20, params.page * 20);
    return Promise.resolve(comments);
  }

  update(answer: AnswerComment): Promise<void> {
    const index = this.items.findIndex(
      (item) => item.id.value === answer.id.value,
    );
    if (index !== -1) {
      this.items[index] = answer;
    }
    return Promise.resolve();
  }

  findById(id: string): Promise<AnswerComment | null> {
    const comment = this.items.find((item) => item.id.value === id);
    return Promise.resolve(comment || null);
  }

  delete(comment: AnswerComment): Promise<void> {
    const index = this.items.findIndex(
      (item) => item.id.value === comment.id.value,
    );
    if (index !== -1) {
      this.items.splice(index, 1);
    }
    return Promise.resolve();
  }
}
