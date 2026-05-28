import { CreateQuestionUseCase } from '@/domain/forum/use-cases/create-question';
import { PrismaQuestionRepository } from '@/infra/database/prisma/repositories/prisma-question-repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import z from 'zod';

export const createQuestionBodySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

export type CreateQuestionBody = z.infer<typeof createQuestionBodySchema>;

@Injectable()
export class CreateQuestionService {
  constructor(private readonly repository: PrismaQuestionRepository) {}

  async execute(data: CreateQuestionBody, authorId: string) {
    const { title, content } = data;
    const useCase = new CreateQuestionUseCase(this.repository);
    const result = await useCase.execute({
      title,
      content,
      authorId,
      attachmentIds: [],
    });

    if (isLeft(result)) {
      throw new BadRequestException(result.left.message);
    }

    return { id: result.right.question.id.toString() };
  }
}
