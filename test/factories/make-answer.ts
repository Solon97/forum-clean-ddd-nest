import { Answer, AnswerProps } from '@/domain/forum/entities/answer';
import { UniqueEntityId } from '@/shared/entities/value-objects/unique-entity-id';

export function makeAnswer(
  override: Partial<AnswerProps> = {},
  id?: UniqueEntityId,
): Answer {
  const answer: Answer = new Answer(
    {
      content: 'This is an example answer.',
      authorId: new UniqueEntityId(),
      questionId: new UniqueEntityId(),
      ...override,
    },
    id,
  );
  return answer;
}
