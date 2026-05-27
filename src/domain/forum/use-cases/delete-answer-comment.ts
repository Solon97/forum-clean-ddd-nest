import { Either, left, right } from 'fp-ts/lib/Either';
import { AnswerCommentRepository } from '../repositories/answer-comment-repository';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';

interface DeleteAnswerCommentUseCaseInput {
  commentId: string;
  authorId: string;
}

export class DeleteAnswerCommentUseCase {
  constructor(private answerCommentRepository: AnswerCommentRepository) {}

  async execute({
    commentId,
    authorId,
  }: DeleteAnswerCommentUseCaseInput): Promise<
    Either<ResourceNotFoundError, undefined>
  > {
    const comment = await this.answerCommentRepository.findById(commentId);
    if (!comment || comment.authorId.toString() !== authorId) {
      return left(new ResourceNotFoundError());
    }

    await this.answerCommentRepository.delete(comment);
    return right(undefined);
  }
}
