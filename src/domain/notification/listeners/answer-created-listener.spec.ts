import { AnswerRepository } from '@/domain/forum/repositories/answer-repository';
import { QuestionRepository } from '@/domain/forum/repositories/question-repository';
import { AnswerQuestionUseCase } from '@/domain/forum/use-cases/answer-question';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import { makeQuestion } from '@test/factories/make-question';
import { assertEitherIsRight } from '@test/helpers/assert-either';
import { assertSpyCalled } from '@test/helpers/spy-helpers';
import { InMemoryAnswerRepository } from '@test/repositories/in-memory-answer-repository';
import { InMemoryNotificationRepository } from '@test/repositories/in-memory-notification-repository';
import { InMemoryQuestionRepository } from '@test/repositories/in-memory-question-repository';
import { Mock } from 'vitest';
import { NotificationRepository } from '../repositories/notification-repository';
import { SendNotificationUseCase } from '../use-cases/send-notification';
import { AnswerCreatedListener } from './answer-created-listener';

let inMemoryQuestionRepository: QuestionRepository;
let inMemoryNotificationRepository: NotificationRepository;
let inMemoryAnswerRepository: AnswerRepository;
let sendNotificationUseCase: SendNotificationUseCase;
let answerQuestionUseCase: AnswerQuestionUseCase;
let sendNotificationExecuteSpy: Mock<typeof sendNotificationUseCase.execute>;

describe('AnswerCreatedListener', () => {
  beforeEach(() => {
    inMemoryQuestionRepository = new InMemoryQuestionRepository();
    inMemoryNotificationRepository = new InMemoryNotificationRepository();
    inMemoryAnswerRepository = new InMemoryAnswerRepository();
    sendNotificationUseCase = new SendNotificationUseCase(
      inMemoryNotificationRepository,
    );
    answerQuestionUseCase = new AnswerQuestionUseCase(inMemoryAnswerRepository);
    new AnswerCreatedListener(
      inMemoryQuestionRepository,
      sendNotificationUseCase,
    );

    sendNotificationExecuteSpy = vi.spyOn(sendNotificationUseCase, 'execute');
  });

  it('should send a notification when a new answer is created', async () => {
    const question = makeQuestion();
    await inMemoryQuestionRepository.create(question);

    const result = await answerQuestionUseCase.execute({
      questionId: question.id.toString(),
      content: 'You can use Jest for testing event listeners.',
      authorId: new UniqueEntityId().toString(),
      attachmentIds: [],
    });

    assertEitherIsRight(result);
    const answer = result.right.answer;
    assertSpyCalled(sendNotificationExecuteSpy, {
      recipientId: question.authorId.toString(),
      title: `Nova resposta em "${question.excerptTitle}"`,
      content: answer.excerpt,
    });
  });
});
