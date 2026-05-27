import { AnswerAttachment } from '@/domain/forum/entities/answer-attachment';
import { AnswerAttachmentsRepository } from '@/domain/forum/repositories/answer-attachments-repository';

export class InMemoryAnswerAttachmentsRepository implements AnswerAttachmentsRepository {
  public items: AnswerAttachment[] = [];

  async findManyByAnswerId(answerId: string): Promise<AnswerAttachment[]> {
    const attachments = this.items.filter(
      (item) => item.answerId.toString() === answerId,
    );
    return Promise.resolve(attachments);
  }
}
