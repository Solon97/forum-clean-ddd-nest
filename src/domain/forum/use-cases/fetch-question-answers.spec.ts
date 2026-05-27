import { PaginationParams } from '@/shared/repositories/pagination-params';
import { assertSpyCalled } from '@test/helpers/spy-helpers';
import { InMemoryAnswerRepository } from '@test/repositories/in-memory-answer-repository';
import { Mock } from 'vitest';
import { AnswerRepository } from '../repositories/answer-repository';
import { FetchQuestionAnswersUseCase } from './fetch-question-answers';
import { assertEitherIsRight } from '@test/helpers/assert-either';

let inMemoryAnswerRepository: AnswerRepository;
let sut: FetchQuestionAnswersUseCase;
let sutRepositorySpy: Mock<
  typeof inMemoryAnswerRepository.findManyByQuestionId
>;

describe('Fetch Question Answers', () => {
  beforeEach(() => {
    inMemoryAnswerRepository = new InMemoryAnswerRepository();
    sut = new FetchQuestionAnswersUseCase(inMemoryAnswerRepository);
    sutRepositorySpy = vi.spyOn(
      inMemoryAnswerRepository,
      'findManyByQuestionId',
    );
  });

  it('should be able to fetch question answers', async () => {
    const paginationParams: PaginationParams = { page: 1 };
    const result = await sut.execute({
      paginationParams,
      questionId: 'question-id',
    });

    assertEitherIsRight(result);
    assertSpyCalled(sutRepositorySpy, [paginationParams, 'question-id']);
  });
});
