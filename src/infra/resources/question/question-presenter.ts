import { Question } from '@/domain/forum/entities/question';

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
}
