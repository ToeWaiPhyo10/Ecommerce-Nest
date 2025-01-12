// src/utils/response.util.ts

export interface ResponseFormat<T> {
  statusCode: number;
  message: string;
  data?: T;
  timestamp?: string;
}

export function formatResponse<T>(
  statusCode: number,
  message: string,
  data?: T,
): ResponseFormat<T> {
  return {
    statusCode,
    message,
    data,
  };
}
