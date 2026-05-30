import { UpdateQuestionUseCase } from '@/domain/forum/use-cases/update-question';
import { PrismaAttachmentRepository } from '@/infra/database/prisma/repositories/prisma-attachment-repository';
import { PrismaQuestionAttachmentsRepository } from '@/infra/database/prisma/repositories/prisma-question-attachments-repository';
import { PrismaQuestionRepository } from '@/infra/database/prisma/repositories/prisma-question-repository';
import { handleUseCaseError } from '@/infra/shared/handle-use-case-error';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import z from 'zod';
import { QuestionPresenter } from '../question-presenter';

export const questionIdParamSchema = z.string().uuid();

export type QuestionIdParam = z.infer<typeof questionIdParamSchema>;

export const updateQuestionBodySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  attachmentIds: z.array(z.string().uuid()).optional().default([]),
});

export type UpdateQuestionBody = z.infer<typeof updateQuestionBodySchema>;

@Injectable()
export class UpdateQuestionService {
  constructor(
    private readonly questionRepository: PrismaQuestionRepository,
    private readonly questionAttachmentsRepository: PrismaQuestionAttachmentsRepository,
    private readonly attachmentRepository: PrismaAttachmentRepository,
  ) {}

  async execute(
    data: UpdateQuestionBody,
    authorId: string,
    questionId: QuestionIdParam,
  ) {
    const useCase = new UpdateQuestionUseCase(
      this.questionRepository,
      this.questionAttachmentsRepository,
      this.attachmentRepository,
    );

    const result = await useCase.execute({
      questionId,
      authorId,
      title: data.title,
      content: data.content,
      attachmentIds: data.attachmentIds,
    });

    if (isLeft(result)) {
      handleUseCaseError(result.left);
    }

    return {
      question: QuestionPresenter.toJSON(result.right.question),
    };
  }
}
