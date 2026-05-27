import { QuestionComment } from '@/domain/forum/entities/comment';
import { QuestionCommentRepository } from '@/domain/forum/repositories/question-comment-repository';
import { PaginationParams } from '@/shared/repositories/pagination-params';

export class InMemoryQuestionCommentRepository implements QuestionCommentRepository {
  private items: QuestionComment[] = [];

  create(comment: QuestionComment): Promise<void> {
    this.items.push(comment);
    return Promise.resolve();
  }

  findManyByQuestionId(
    params: PaginationParams,
    questionId: string,
  ): Promise<QuestionComment[]> {
    const comments = this.items
      .filter((comment) => comment.questionId.toString() === questionId)
      .slice((params.page - 1) * 20, params.page * 20);
    return Promise.resolve(comments);
  }

  update(question: QuestionComment): Promise<void> {
    const index = this.items.findIndex(
      (item) => item.id.value === question.id.value,
    );
    if (index !== -1) {
      this.items[index] = question;
    }
    return Promise.resolve();
  }

  findById(id: string): Promise<QuestionComment | null> {
    const comment = this.items.find((item) => item.id.value === id);
    return Promise.resolve(comment || null);
  }

  delete(comment: QuestionComment): Promise<void> {
    const index = this.items.findIndex(
      (item) => item.id.value === comment.id.value,
    );
    if (index !== -1) {
      this.items.splice(index, 1);
    }
    return Promise.resolve();
  }
}
