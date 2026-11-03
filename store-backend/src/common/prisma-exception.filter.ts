import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Translates Prisma errors into meaningful HTTP responses instead of leaking
 * 500s: unique-constraint violations -> 409, missing records -> 404, foreign-key
 * violations -> 409, validation errors -> 400.
 */
@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Unexpected database error';

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'A record with these unique values already exists.';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'The requested record was not found.';
          break;
        case 'P2003':
          status = HttpStatus.CONFLICT;
          message =
            'This record is still referenced by other data and cannot be removed.';
          break;
        case 'P2016':
        case 'P2018':
          status = HttpStatus.NOT_FOUND;
          message = 'A related record could not be found.';
          break;
        default:
          this.logger.error(`Prisma error ${exception.code}: ${exception.message}`);
          status = HttpStatus.BAD_REQUEST;
          message = 'Invalid data supplied to the database.';
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data supplied to the database.';
    }

    response.status(status).json({ statusCode: status, message });
  }
}
