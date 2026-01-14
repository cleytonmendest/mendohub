/**
 * Format Utilities
 *
 * Funções para formatação de dados (datas, valores, etc).
 */

/**
 * Formata data para formato brasileiro (dd/mm/yyyy)
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Formata data e hora para formato brasileiro (dd/mm/yyyy às HH:mm)
 */
export function formatDateTime(
  date: string | Date | null | undefined
): string {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Formata data relativa (ex: "há 2 dias", "ontem", "hoje")
 */
export function formatRelativeDate(
  date: string | Date | null | undefined
): string {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Há ${Math.floor(diffDays / 30)} meses`;

  return `Há ${Math.floor(diffDays / 365)} anos`;
}

/**
 * Formata valor monetário em Real (R$)
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
