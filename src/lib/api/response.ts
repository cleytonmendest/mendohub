/**
 * API Response Helpers
 *
 * Padroniza respostas de todas as API routes do MendoHub.
 * Garante consistência no formato de sucesso/erro para o frontend.
 */

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: string;
  stack?: string;
};

/**
 * Retorna uma resposta de sucesso padronizada
 *
 * @param data - Dados a serem retornados
 * @returns Response com { success: true, data }
 *
 * @example
 * return success({ conversations: [...] });
 */
export function success<T>(data: T): Response {
  return Response.json({ success: true, data } as ApiSuccess<T>);
}

/**
 * Retorna uma resposta de erro padronizada
 *
 * @param message - Mensagem de erro para o usuário
 * @param status - HTTP status code (default: 400)
 * @returns Response com { success: false, error }
 *
 * @example
 * return error('Conversa não encontrada', 404);
 */
export function error(message: string, status = 400): Response {
  return Response.json(
    {
      success: false,
      error: message,
      // Incluir stack trace apenas em desenvolvimento
      ...(process.env.NODE_ENV === 'development' && {
        stack: new Error().stack,
      }),
    } as ApiError,
    { status }
  );
}
