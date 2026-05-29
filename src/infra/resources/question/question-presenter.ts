import { Question } from '@/domain/forum/entities/question';
import { QuestionComment } from '@/domain/forum/entities/comment';

export class QuestionPresenter {
  static toJSON(question: Question) {
    return {
      id: question.id.toString(),
      title: question.title,
      content: question.content,
      slug: question.slug.value,
      bestAnswerId: question.bestAnswerId?.toString(),
      authorId: question.authorId,
      createdAt: question.createdAt,
    };
  }

  static toJSONList(questions: Question[]) {
    return questions.map((question) => this.toJSON(question));
  }

  static toJSONComment(comment: QuestionComment) {
    return {
      id: comment.id.toString(),
      content: comment.content,
      authorId: comment.authorId.toString(),
      questionId: comment.questionId.toString(),
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  static toJSONCommentList(comments: QuestionComment[]) {
    return comments.map((comment) => this.toJSONComment(comment));
  }
}
