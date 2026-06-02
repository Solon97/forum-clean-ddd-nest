import { QuestionBestAnswerDefinedEvent } from '@/domain/forum/entities/events/question-best-answer-defined';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import { makeAnswer } from '@test/factories/make-answer';
import { makeQuestion } from '@test/factories/make-question';
import { InMemoryAnswerRepository } from '@test/repositories/in-memory-answer-repository';
import { QuestionBestAnswerDefinedNotificationStrategy } from './question-best-answer-defined-notification-strategy';

let inMemoryAnswerRepository: InMemoryAnswerRepository;
let sut: QuestionBestAnswerDefinedNotificationStrategy;

describe('QuestionBestAnswerDefinedNotificationStrategy', () => {
  beforeEach(() => {
    inMemoryAnswerRepository = new InMemoryAnswerRepository();
    sut = new QuestionBestAnswerDefinedNotificationStrategy(
      inMemoryAnswerRepository,
    );
  });

  it('should return a NotificationIntent when the answer is found', async () => {
    const answer = makeAnswer();
    await inMemoryAnswerRepository.create(answer);

    const question = makeQuestion();
    const event = new QuestionBestAnswerDefinedEvent(question, answer.id);

    const result = await sut.handle(event);

    expect(result).not.toBeNull();
    expect(result?.recipientId).toBe(answer.authorId.toString());
    expect(result?.subject).toBe(
      'Sua resposta foi escolhida como melhor resposta!',
    );
    expect(result?.body).toBe(answer.excerpt);
  });

  it('should return null when the answer is not found', async () => {
    const question = makeQuestion();
    const nonExistentAnswerId = UniqueEntityId.create();
    const event = new QuestionBestAnswerDefinedEvent(
      question,
      nonExistentAnswerId,
    );

    const result = await sut.handle(event);

    expect(result).toBeNull();
  });
});
