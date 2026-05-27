import { QuestionAttachment } from '@/domain/forum/entities/question-attachment';
import { QuestionAttachmentsRepository } from '@/domain/forum/repositories/question-attachments-repository';

export class InMemoryQuestionAttachmentsRepository implements QuestionAttachmentsRepository {
  public items: QuestionAttachment[] = [];

  async findManyByQuestionId(
    questionId: string,
  ): Promise<QuestionAttachment[]> {
    const attachments = this.items.filter(
      (item) => item.questionId.toString() === questionId,
    );
    return Promise.resolve(attachments);
  }
}
