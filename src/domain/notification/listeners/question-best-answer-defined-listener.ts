import { AnswerRepository } from '@/domain/forum/repositories/answer-repository';
import { EventHandler } from '@/shared/events/event-handler';
import { SendNotificationUseCase } from '../use-cases/send-notification';
import { DomainEvents } from '@/shared/events/domain-events';
import { QuestionBestAnswerDefinedEvent } from '@/domain/forum/entities/events/question-best-answer-defined';

export class QuestionBestAnswerDefinedListener implements EventHandler {
  constructor(
    private answerRepository: AnswerRepository,
    private sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.handle.bind(this),
      QuestionBestAnswerDefinedEvent.name,
    );
  }

  private async handle({
    bestAnswerId,
  }: QuestionBestAnswerDefinedEvent): Promise<void> {
    const answer = await this.answerRepository.findById(
      bestAnswerId.toString(),
    );

    if (!answer) {
      return;
    }

    await this.sendNotification.execute({
      recipientId: answer.authorId.toString(),
      title: 'Sua resposta foi escolhida como melhor resposta!',
      content: answer.excerpt,
    });
  }
}
