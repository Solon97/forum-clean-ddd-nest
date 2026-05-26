import { BadRequestException, PipeTransform } from '@nestjs/common';
import { z } from 'zod';

const DEFAULT_ERROR_MESSAGE = 'Validation failed';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodType) {}

  transform(value: unknown) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException({
          message: DEFAULT_ERROR_MESSAGE,
          statusCode: 400,
          errors: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      throw new BadRequestException(DEFAULT_ERROR_MESSAGE);
    }
  }
}
