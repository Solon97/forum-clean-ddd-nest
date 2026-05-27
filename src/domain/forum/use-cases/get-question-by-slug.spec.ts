import { Mock } from 'vitest';
import { makeQuestion } from '@test/factories/make-question';
import { InMemoryQuestionRepository } from '@test/repositories/in-memory-question-repository';
import { QuestionRepository } from '../repositories/question-repository';
import { GetQuestionBySlugUseCase } from './get-question-by-slug';
import { assertSpyCalled } from '@test/helpers/spy-helpers';
import {
  assertEitherIsLeft,
  assertEitherIsRight,
} from '@test/helpers/assert-either';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';

let inMemoryQuestionRepository: QuestionRepository;
let sut: GetQuestionBySlugUseCase;
let sutRepositorySpy: Mock<typeof inMemoryQuestionRepository.findBySlug>;

describe('Get Question by Slug', () => {
  beforeEach(() => {
    inMemoryQuestionRepository = new InMemoryQuestionRepository();
    sut = new GetQuestionBySlugUseCase(inMemoryQuestionRepository);
    sutRepositorySpy = vi.spyOn(inMemoryQuestionRepository, 'findBySlug');
  });

  it('should be able to get a question by slug', async () => {
    const exampleQuestion = makeQuestion();
    await inMemoryQuestionRepository.create(exampleQuestion);

    const result = await sut.execute({
      slug: exampleQuestion.slug.value,
    });

    assertEitherIsRight(result);
    assertSpyCalled(sutRepositorySpy, exampleQuestion.slug.value);
    expect(result.right.question).toEqual(exampleQuestion);
  });

  it('should not be able to get a question with an invalid slug', async () => {
    const result = await sut.execute({
      slug: 'invalid-slug',
    });

    assertEitherIsLeft(result);
    expect(result.left).toBeInstanceOf(ResourceNotFoundError);
    assertSpyCalled(sutRepositorySpy, 'invalid-slug');
  });
});
