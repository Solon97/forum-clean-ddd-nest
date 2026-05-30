import { AnswerQuestionUseCase } from '@/domain/forum/use-cases/answer-question';
import { PrismaAttachmentRepository } from '@/infra/database/prisma/repositories/prisma-attachment-repository';
import { PrismaAnswerRepository } from '@/infra/database/prisma/repositories/prisma-answer-repository';
import { handleUseCaseError } from '@/infra/shared/handle-use-case-error';
import { Injectable } from '@nestjs/common';
import { isLeft } from 'fp-ts/lib/Either';
import z from 'zod';

export const answerQuestionQuestionIdParamSchema = z.string().uuid();

export type AnswerQuestionQuestionIdParam = z.infer<
  typeof answerQuestionQuestionIdParamSchema
>;

export const answerQuestionBodySchema = z.object({
  content: z.string().min(1, 'Content is required'),
  attachmentIds: z.array(z.string().uuid()).optional().default([]),
});

export type AnswerQuestionBody = z.infer<typeof answerQuestionBodySchema>;

@Injectable()
export class AnswerQuestionService {
  constructor(
    private readonly answerRepository: PrismaAnswerRepository,
    private readonly attachmentRepository: PrismaAttachmentRepository,
  ) {}

  async execute(
    data: AnswerQuestionBody,
    authorId: string,
    questionId: AnswerQuestionQuestionIdParam,
  ) {
    const useCase = new AnswerQuestionUseCase(
      this.answerRepository,
      this.attachmentRepository,
    );
    const result = await useCase.execute({
      questionId,
      authorId,
      content: data.content,
      attachmentIds: data.attachmentIds,
    });

    if (isLeft(result)) {
      handleUseCaseError(result.left);
    }

    return {
      id: result.right.answer.id.toString(),
    };
  }
}
