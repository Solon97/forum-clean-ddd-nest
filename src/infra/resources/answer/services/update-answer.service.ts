import { UpdateAnswerUseCase } from '@/domain/forum/use-cases/update-answer';
import { PrismaAnswerAttachmentsRepository } from '@/infra/database/prisma/repositories/prisma-answer-attachments-repository';
import { PrismaAnswerRepository } from '@/infra/database/prisma/repositories/prisma-answer-repository';
import { handleUseCaseError } from '@/infra/shared/handle-use-case-error';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import z from 'zod';
import { AnswerPresenter } from '../answer-presenter';

export const answerIdParamSchema = z.string().uuid();

export type AnswerIdParam = z.infer<typeof answerIdParamSchema>;

export const updateAnswerBodySchema = z.object({
  content: z.string().min(1, 'Content is required'),
  attachmentIds: z.array(z.string().uuid()).optional().default([]),
});

export type UpdateAnswerBody = z.infer<typeof updateAnswerBodySchema>;

@Injectable()
export class UpdateAnswerService {
  constructor(
    private readonly answerRepository: PrismaAnswerRepository,
    private readonly answerAttachmentsRepository: PrismaAnswerAttachmentsRepository,
  ) {}

  async execute(
    data: UpdateAnswerBody,
    authorId: string,
    answerId: AnswerIdParam,
  ) {
    const useCase = new UpdateAnswerUseCase(
      this.answerRepository,
      this.answerAttachmentsRepository,
    );

    const result = await useCase.execute({
      answerId,
      authorId,
      content: data.content,
      attachmentIds: data.attachmentIds,
    });

    if (isLeft(result)) {
      handleUseCaseError(result.left);
    }

    return {
      answer: AnswerPresenter.toJSON(result.right.answer),
    };
  }
}
