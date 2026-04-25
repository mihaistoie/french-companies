export class AppError extends Error {
  public readonly messageKey: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(messageKey: string, statusCode = 500, isOperational = true, details?: unknown) {
    super(messageKey);
    this.messageKey = messageKey;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
  }
}
