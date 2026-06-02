import { AnswerRepository } from '@/domain/forum/repositories/answer-repository';
import { QuestionBestAnswerDefinedEvent } from '@/domain/forum/entities/events/question-best-answer-defined';
import { NotificationIntent } from '../notification-intent';
import { NotificationEventStrategy } from './notification-event-strategy';

export class QuestionBestAnswerDefinedNotificationStrategy implements NotificationEventStrategy<QuestionBestAnswerDefinedEvent> {
  constructor(private answerRepository: AnswerRepository) {}

  async handle(
    event: QuestionBestAnswerDefinedEvent,
  ): Promise<NotificationIntent | null> {
    const answer = await this.answerRepository.findById(
      event.bestAnswerId.toString(),
    );

    if (!answer) {
      return null;
    }

    return {
      recipientId: answer.authorId.toString(),
      subject: 'Sua resposta foi escolhida como melhor resposta!',
      body: answer.excerpt,
    };
  }
}
