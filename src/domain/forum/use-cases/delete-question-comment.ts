import { Either, left, right } from 'fp-ts/lib/Either';
import { QuestionCommentRepository } from '../repositories/question-comment-repository';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found';

interface DeleteQuestionCommentUseCaseInput {
  commentId: string;
  authorId: string;
}

export class DeleteQuestionCommentUseCase {
  constructor(private questionCommentRepository: QuestionCommentRepository) {}

  async execute({
    commentId,
    authorId,
  }: DeleteQuestionCommentUseCaseInput): Promise<
    Either<ResourceNotFoundError, undefined>
  > {
    const comment = await this.questionCommentRepository.findById(commentId);
    if (!comment || comment.authorId.toString() !== authorId) {
      return left(new ResourceNotFoundError());
    }

    await this.questionCommentRepository.delete(comment);
    return right(undefined);
  }
}
