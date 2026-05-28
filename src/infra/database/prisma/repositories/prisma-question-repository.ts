import { Question } from '@/domain/forum/entities/question';
import { QuestionRepository } from '@/domain/forum/repositories/question-repository';
import { PaginationParams } from '@/shared/repositories/pagination-params';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaQuestionRepository implements QuestionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(question: Question): Promise<void> {
    await this.prismaService.question.create({
      data: {
        id: question.id.value,
        title: question.title,
        content: question.content,
        slug: question.slug.value,
        authorId: question.authorId.value,
        bestAnswerId: question.bestAnswerId?.value,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      },
    });
  }

  update(question: Question): Promise<void> {
    throw new Error('Method not implemented.');
  }
  findBySlug(slug: string): Promise<Question | null> {
    throw new Error('Method not implemented.');
  }
  findManyRecent(params: PaginationParams): Promise<Question[]> {
    throw new Error('Method not implemented.');
  }
  findById(id: string): Promise<Question | null> {
    throw new Error('Method not implemented.');
  }
  delete(question: Question): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
