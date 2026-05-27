import { AnswerCreatedEvent } from '@/domain/forum/entities/events/answer-created-event';
import { QuestionRepository } from '@/domain/forum/repositories/question-repository';
import { DomainEvents } from '@/shared/events/domain-events';
import { EventHandler } from '@/shared/events/event-handler';
import { SendNotificationUseCase } from '../use-cases/send-notification';

export class AnswerCreatedListener implements EventHandler {
  constructor(
    private questionRepository: QuestionRepository,
    private sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewAnswerNotification.bind(this),
      AnswerCreatedEvent.name,
    );
  }

  private async sendNewAnswerNotification({ answer }: AnswerCreatedEvent) {
    const question = await this.questionRepository.findById(
      answer.questionId.toString(),
    );

    if (!question) {
      return;
    }

    await this.sendNotification.execute({
      recipientId: question.authorId.toString(),
      title: `Nova resposta em "${question.excerptTitle}"`,
      content: answer.excerpt,
    });
  }
}
