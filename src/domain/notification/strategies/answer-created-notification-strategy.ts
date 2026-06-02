import { AnswerCreatedEvent } from '@/domain/forum/entities/events/answer-created';
import { QuestionRepository } from '@/domain/forum/repositories/question-repository';
import { NotificationIntent } from '../notification-intent';
import { NotificationEventStrategy } from './notification-event-strategy';

export class AnswerCreatedNotificationStrategy implements NotificationEventStrategy<AnswerCreatedEvent> {
  constructor(private questionRepository: QuestionRepository) {}

  async handle(event: AnswerCreatedEvent): Promise<NotificationIntent | null> {
    const question = await this.questionRepository.findById(
      event.answer.questionId.toString(),
    );

    if (!question) {
      return null;
    }

    return {
      recipientId: question.authorId.toString(),
      subject: `Nova resposta em "${question.excerptTitle}"`,
      body: event.answer.excerpt,
    };
  }
}
