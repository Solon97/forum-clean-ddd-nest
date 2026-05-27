import { AnswerAttachment } from '../entities/answer-attachment';

export interface AnswerAttachmentsRepository {
  items: AnswerAttachment[];
  findManyByAnswerId(answerId: string): Promise<AnswerAttachment[]>;
}
