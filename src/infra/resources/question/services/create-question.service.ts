import { CreateQuestionUseCase } from '@/domain/forum/use-cases/create-question';
import { PrismaAttachmentRepository } from '@/infra/database/prisma/repositories/prisma-attachment-repository';
import { PrismaQuestionRepository } from '@/infra/database/prisma/repositories/prisma-question-repository';
import { handleUseCaseError } from '@/infra/shared/handle-use-case-error';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import z from 'zod';

export const createQuestionBodySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  attachmentIds: z.array(z.string().uuid()).optional().default([]),
});

export type CreateQuestionBody = z.infer<typeof createQuestionBodySchema>;

@Injectable()
export class CreateQuestionService {
  constructor(
    private readonly repository: PrismaQuestionRepository,
    private readonly attachmentRepository: PrismaAttachmentRepository,
  ) {}

  async execute(data: CreateQuestionBody, authorId: string) {
    const { title, content, attachmentIds } = data;
    const useCase = new CreateQuestionUseCase(
      this.repository,
      this.attachmentRepository,
    );
    const result = await useCase.execute({
      title,
      content,
      authorId,
      attachmentIds,
    });

    if (isLeft(result)) {
      handleUseCaseError(result.left);
    }

    return { id: result.right.question.id.toString() };
  }
}
