import { InvalidTokenError } from '@/domain/forum/use-cases/errors/invalid-token-error';
import { WrongCredentialsError } from '@/domain/forum/use-cases/errors/wrong-credentials-error';
import { NotAllowedError } from '@/shared/errors/not-allowed';
import { ResourceNotFoundError } from '@/shared/errors/resource-not-found';
import { UseCaseError } from '@/shared/errors/use-case-error';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  NotFoundException,
  Type,
  UnauthorizedException,
} from '@nestjs/common';

export type ErrorMapping = Record<string, Type<HttpException>>;

/**
 * Handles errors thrown by use cases and maps them to appropriate HTTP exceptions.
 *
 * @param error - The error thrown by the use case.
 * @param customMappings - Optional custom mappings of error class names to HTTP exception classes.
 * @throws {HttpException} - Throws an appropriate HTTP exception based on the error type.
 */
export function handleUseCaseError(
  error: UseCaseError,
  customMappings: ErrorMapping = {},
): never {
  const errorClassName = error.constructor.name;

  //? validate if there's a custom mapping for the error class
  const CustomException = customMappings[errorClassName];
  if (CustomException) {
    throw new CustomException(error.message);
  }

  //? If no custom mapping is found, use the default mappings
  switch (errorClassName) {
    case ResourceNotFoundError.name:
      throw new NotFoundException(error.message);
    case NotAllowedError.name:
      throw new ForbiddenException(error.message);
    case WrongCredentialsError.name:
      throw new UnauthorizedException(error.message);
    case InvalidTokenError.name:
      throw new UnauthorizedException(error.message);
    default:
      throw new BadRequestException(error.message);
  }
}
