export type AppError = Error & {
  statusCode?: number;
  code?: string;
};

function createError(message: string, statusCode: number, code: string): AppError {
  const error = new Error(message) as AppError;
  error.name = code;
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

export function ForbiddenError(message = "Forbidden") {
  return createError(message, 403, "FORBIDDEN");
}
