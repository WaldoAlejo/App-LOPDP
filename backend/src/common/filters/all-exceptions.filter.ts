import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;
      errorCode = `HTTP_${status}`;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle Prisma errors without leaking database details
      status = HttpStatus.BAD_REQUEST;
      errorCode = `PRISMA_${exception.code}`;
      switch (exception.code) {
        case 'P2002':
          message = 'El registro ya existe';
          break;
        case 'P2025':
          message = 'Registro no encontrado';
          status = HttpStatus.NOT_FOUND;
          break;
        case 'P2003':
          message = 'Violación de restricción de integridad';
          break;
        default:
          message = 'Error en la base de datos';
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Datos de entrada inválidos';
      errorCode = 'PRISMA_VALIDATION';
    }

    // Log the full error internally (without sensitive data)
    const clientIp = request.ip || request.headers['x-forwarded-for'] || 'unknown';
    this.logger.error(
      `[${request.method}] ${request.url} - ${status} - ${clientIp} - ${errorCode}: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Never expose internal error details in production
    const isDev = process.env.NODE_ENV !== 'production';

    response.status(status).json({
      statusCode: status,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(isDev && exception instanceof Error
        ? { debug: exception.message }
        : {}),
    });
  }
}
