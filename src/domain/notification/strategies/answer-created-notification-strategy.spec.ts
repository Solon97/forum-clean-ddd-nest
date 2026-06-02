import { AnswerCreatedEvent } from '@/domain/forum/entities/events/answer-created';
import { makeAnswer } from '@test/factories/make-answer';
import { makeQuestion } from '@test/factories/make-question';
import { InMemoryQuestionRepository } from '@test/repositories/in-memory-question-repository';
import { AnswerCreatedNotificationStrategy } from './answer-created-notification-strategy';

let questionRepository: InMemoryQuestionRepository;
let strategy: AnswerCreatedNotificationStrategy;

describe('AnswerCreatedNotificationStrategy', () => {
  beforeEach(() => {
    questionRepository = new InMemoryQuestionRepository();
    strategy = new AnswerCreatedNotificationStrategy(questionRepository);
  });

  it('should return a NotificationIntent when question is found', async () => {
    const question = makeQuestion();
    await questionRepository.create(question);

    const answer = makeAnswer({ questionId: question.id });
    const event = new AnswerCreatedEvent(answer);

    const result = await strategy.handle(event);

    expect(result).not.toBeNull();
    expect(result).toEqual({
      recipientId: question.authorId.toString(),
      subject: `Nova resposta em "${question.excerptTitle}"`,
      body: answer.excerpt,
    });
  });

  it('should return null when question is not found', async () => {
    const answer = makeAnswer();
    const event = new AnswerCreatedEvent(answer);

    const result = await strategy.handle(event);

    expect(result).toBeNull();
  });
});
