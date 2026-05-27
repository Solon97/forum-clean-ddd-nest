import { AnswerRepository } from '@/domain/forum/repositories/answer-repository';
import { QuestionRepository } from '@/domain/forum/repositories/question-repository';
import { SetBestAnswerUseCase } from '@/domain/forum/use-cases/set-best-answer';
import { makeAnswer } from '@test/factories/make-answer';
import { makeQuestion } from '@test/factories/make-question';
import { assertEitherIsRight } from '@test/helpers/assert-either';
import { assertSpyCalled } from '@test/helpers/spy-helpers';
import { InMemoryAnswerRepository } from '@test/repositories/in-memory-answer-repository';
import { InMemoryNotificationRepository } from '@test/repositories/in-memory-notification-repository';
import { InMemoryQuestionRepository } from '@test/repositories/in-memory-question-repository';
import { Mock } from 'vitest';
import { NotificationRepository } from '../repositories/notification-repository';
import { SendNotificationUseCase } from '../use-cases/send-notification';
import { QuestionBestAnswerSettedListener } from './question-best-answer-setted-listener';

let inMemoryQuestionRepository: QuestionRepository;
let inMemoryNotificationRepository: NotificationRepository;
let inMemoryAnswerRepository: AnswerRepository;
let sendNotificationUseCase: SendNotificationUseCase;
let setBestAnswerUseCase: SetBestAnswerUseCase;
let sendNotificationExecuteSpy: Mock<typeof sendNotificationUseCase.execute>;

describe('Question Best Answer Setted Listener', () => {
  beforeEach(() => {
    inMemoryQuestionRepository = new InMemoryQuestionRepository();
    inMemoryNotificationRepository = new InMemoryNotificationRepository();
    inMemoryAnswerRepository = new InMemoryAnswerRepository();
    sendNotificationUseCase = new SendNotificationUseCase(
      inMemoryNotificationRepository,
    );
    setBestAnswerUseCase = new SetBestAnswerUseCase(
      inMemoryAnswerRepository,
      inMemoryQuestionRepository,
    );
    new QuestionBestAnswerSettedListener(
      inMemoryAnswerRepository,
      sendNotificationUseCase,
    );

    sendNotificationExecuteSpy = vi.spyOn(sendNotificationUseCase, 'execute');
  });

  it('should send a notification when a question best answer is set', async () => {
    const question = makeQuestion();
    await inMemoryQuestionRepository.create(question);
    const answer = makeAnswer({ questionId: question.id });
    await inMemoryAnswerRepository.create(answer);
    const result = await setBestAnswerUseCase.execute({
      answerId: answer.id.toString(),
      authorId: question.authorId.toString(),
    });

    assertEitherIsRight(result);
    assertSpyCalled(sendNotificationExecuteSpy, {
      recipientId: answer.authorId.toString(),
      title: 'Sua resposta foi escolhida como melhor resposta!',
      content: answer.excerpt,
    });
  });
});
