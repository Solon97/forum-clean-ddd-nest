import { AnswerCreatedEvent } from '@/domain/forum/entities/events/answer-created';
import { QuestionBestAnswerDefinedEvent } from '@/domain/forum/entities/events/question-best-answer-defined';
import { AnswerCreatedNotificationStrategy } from '@/domain/notification/strategies/answer-created-notification-strategy';
import { QuestionBestAnswerDefinedNotificationStrategy } from '@/domain/notification/strategies/question-best-answer-defined-notification-strategy';
import { NotificationStrategyRegistry } from '@/domain/notification/strategies/notification-strategy-registry';
import { DispatchNotificationUseCase } from '@/domain/notification/use-cases/dispatch-notification-use-case';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaAnswerRepository } from '@/infra/database/prisma/repositories/prisma-answer-repository';
import { PrismaQuestionRepository } from '@/infra/database/prisma/repositories/prisma-question-repository';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConsoleEmailGateway } from '@/infra/email/console-email-gateway';
import { DomainEvents } from '@/shared/events/domain-events';

@Module({
  imports: [DatabaseModule],
  providers: [
    ConsoleEmailGateway,
    {
      provide: DispatchNotificationUseCase,
      useFactory(
        questionRepo: PrismaQuestionRepository,
        answerRepo: PrismaAnswerRepository,
        emailGateway: ConsoleEmailGateway,
      ) {
        const registry = new NotificationStrategyRegistry();
        registry.register(
          AnswerCreatedEvent.name,
          new AnswerCreatedNotificationStrategy(questionRepo),
        );
        registry.register(
          QuestionBestAnswerDefinedEvent.name,
          new QuestionBestAnswerDefinedNotificationStrategy(answerRepo),
        );
        return new DispatchNotificationUseCase(registry, emailGateway);
      },
      inject: [
        PrismaQuestionRepository,
        PrismaAnswerRepository,
        ConsoleEmailGateway,
      ],
    },
  ],
})
export class NotificationModule implements OnModuleInit {
  constructor(private dispatcher: DispatchNotificationUseCase) {}

  onModuleInit() {
    DomainEvents.register(
      this.dispatcher.execute.bind(this.dispatcher),
      AnswerCreatedEvent.name,
    );
    DomainEvents.register(
      this.dispatcher.execute.bind(this.dispatcher),
      QuestionBestAnswerDefinedEvent.name,
    );
  }
}
