import { PaginationParams } from '@/shared/repositories/pagination-params';
import { assertSpyCalled } from '@test/helpers/spy-helpers';
import { InMemoryAnswerCommentRepository } from '@test/repositories/in-memory-answer-comment-repository';
import { Mock } from 'vitest';
import { AnswerCommentRepository } from '../repositories/answer-comment-repository';
import { FetchAnswerCommentsUseCase } from './fetch-answer-comments';
import { assertEitherIsRight } from '@test/helpers/assert-either';

let inMemoryAnswerCommentRepository: AnswerCommentRepository;
let sut: FetchAnswerCommentsUseCase;
let sutRepositorySpy: Mock<
  typeof inMemoryAnswerCommentRepository.findManyByAnswerId
>;

describe('Fetch Answer Comments', () => {
  beforeEach(() => {
    inMemoryAnswerCommentRepository = new InMemoryAnswerCommentRepository();
    sut = new FetchAnswerCommentsUseCase(inMemoryAnswerCommentRepository);
    sutRepositorySpy = vi.spyOn(
      inMemoryAnswerCommentRepository,
      'findManyByAnswerId',
    );
  });

  it('should be able to fetch answer comments', async () => {
    const paginationParams: PaginationParams = { page: 1 };

    const result = await sut.execute({
      paginationParams,
      answerId: 'answer-id',
    });

    assertEitherIsRight(result);
    assertSpyCalled(sutRepositorySpy, [paginationParams, 'answer-id']);
  });
});
