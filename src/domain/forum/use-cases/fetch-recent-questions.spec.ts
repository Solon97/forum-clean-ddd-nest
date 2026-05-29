import { assertSpyCalled } from '@test/helpers/spy-helpers';
import { InMemoryQuestionRepository } from '@test/repositories/in-memory-question-repository';
import { Mock } from 'vitest';
import { QuestionRepository } from '../repositories/question-repository';
import { FetchRecentQuestionsUseCase } from './fetch-recent-questions';

let inMemoryQuestionRepository: QuestionRepository;
let sut: FetchRecentQuestionsUseCase;
let sutRepositorySpy: Mock<typeof inMemoryQuestionRepository.findManyRecent>;

describe('Fetch Recent Questions', () => {
  beforeEach(() => {
    inMemoryQuestionRepository = new InMemoryQuestionRepository();
    sut = new FetchRecentQuestionsUseCase(inMemoryQuestionRepository);
    sutRepositorySpy = vi.spyOn(inMemoryQuestionRepository, 'findManyRecent');
  });

  it('should be able to fetch recent questions', async () => {
    const result = await sut.execute({ paginationParams: { page: 1 } });
    expect(result).toBeDefined();
    expect(result.questions).toBeInstanceOf(Array);
    assertSpyCalled(sutRepositorySpy, { page: 1 });
  });
});
