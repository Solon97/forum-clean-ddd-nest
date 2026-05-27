import { QuestionAttachment } from '../entities/question-attachment';

export interface QuestionAttachmentsRepository {
  items: QuestionAttachment[];
  findManyByQuestionId(questionId: string): Promise<QuestionAttachment[]>;
}
