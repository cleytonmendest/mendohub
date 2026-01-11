/**
 * Structured Logger
 *
 * Use este logger ao invés de console.log em produção.
 *
 * Benefícios:
 * - Logs estruturados (JSON)
 * - Níveis de log (info, warn, error)
 * - Contexto adicional (metadata)
 * - Fácil integração com ferramentas de observabilidade
 *
 * Exemplo de uso:
 * logger.info('webhook_received', { messageId: 'abc123', from: '+55...' });
 * logger.error('payment_failed', { error: err.message, userId: '...' });
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMetadata {
  [key: string]: unknown;
}

class Logger {
  private log(level: LogLevel, message: string, metadata?: LogMetadata) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...metadata,
    };

    if (process.env.NODE_ENV === 'production') {
      // Em produção, logar como JSON para ferramentas de log
      console.log(JSON.stringify(logEntry));
    } else {
      // Em desenvolvimento, logar de forma legível
      const metaStr = metadata ? ` ${JSON.stringify(metadata)}` : '';
      console.log(`[${level.toUpperCase()}] ${message}${metaStr}`);
    }
  }

  info(message: string, metadata?: LogMetadata) {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: LogMetadata) {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: LogMetadata) {
    this.log('error', message, metadata);
  }

  debug(message: string, metadata?: LogMetadata) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, metadata);
    }
  }
}

export const logger = new Logger();
