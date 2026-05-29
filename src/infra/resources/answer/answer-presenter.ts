import { Answer } from '@/domain/forum/entities/answer';
import { AnswerComment } from '@/domain/forum/entities/comment';

export class AnswerPresenter {
  static toJSON(answer: Answer) {
    return {
      id: answer.id.toString(),
      content: answer.content,
      authorId: answer.authorId.toString(),
      questionId: answer.questionId.toString(),
      createdAt: answer.createdAt,
      updatedAt: answer.updatedAt,
    };
  }

  static toJSONList(answers: Answer[]) {
    return answers.map((answer) => this.toJSON(answer));
  }

  static toJSONComment(comment: AnswerComment) {
    return {
      id: comment.id.toString(),
      content: comment.content,
      authorId: comment.authorId.toString(),
      answerId: comment.answerId.toString(),
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  static toJSONCommentList(comments: AnswerComment[]) {
    return comments.map((comment) => this.toJSONComment(comment));
  }
}
