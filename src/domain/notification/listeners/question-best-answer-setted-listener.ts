import { AnswerRepository } from '@/domain/forum/repositories/answer-repository';
import { EventHandler } from '@/shared/events/event-handler';
import { SendNotificationUseCase } from '../use-cases/send-notification';
import { DomainEvents } from '@/shared/events/domain-events';
import { SetQuestionBestAnswerEvent } from '@/domain/forum/entities/events/set-question-best-answer-event';

export class QuestionBestAnswerSettedListener implements EventHandler {
  constructor(
    private answerRepository: AnswerRepository,
    private sendNotification: SendNotificationUseCase,
  ) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.handle.bind(this),
      SetQuestionBestAnswerEvent.name,
    );
  }

  private async handle({
    bestAnswerId,
  }: SetQuestionBestAnswerEvent): Promise<void> {
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
