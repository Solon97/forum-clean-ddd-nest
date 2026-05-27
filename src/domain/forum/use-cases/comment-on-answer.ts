import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';
import { AnswerComment } from '../entities/comment';
import { AnswerCommentRepository } from '../repositories/answer-comment-repository';
import { AnswerRepository } from '../repositories/answer-repository';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';
import { Either, left, right } from 'fp-ts/lib/Either';

export interface CommentOnAnswerUseCaseInput {
  authorId: string;
  answerId: string;
  content: string;
}

export interface CommentOnAnswerUseCaseOutput {
  comment: AnswerComment;
}

export class CommentOnAnswerUseCase {
  constructor(
    private answerRepository: AnswerRepository,
    private answerCommentRepository: AnswerCommentRepository,
  ) {}

  async execute({
    authorId,
    answerId,
    content,
  }: CommentOnAnswerUseCaseInput): Promise<
    Either<ResourceNotFoundError, CommentOnAnswerUseCaseOutput>
  > {
    const answer = await this.answerRepository.findById(answerId);
    if (!answer) {
      return left(new ResourceNotFoundError());
    }
    const comment = new AnswerComment({
      authorId: new UniqueEntityId(authorId),
      answerId: new UniqueEntityId(answerId),
      content,
    });

    await this.answerCommentRepository.create(comment);

    return right({
      comment,
    });
  }
}
