/** Форматування ціни (грн) */
export function formatPrice(value) {
  const num = Number.parseFloat(value);
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    maximumFractionDigits: 0,
  }).format(num);
}

/** ISO duration "HH:MM:SS" → людський текст */
export function formatDuration(duration) {
  if (!duration) return '—';
  const parts = String(duration).split(':');
  const hours = Number.parseInt(parts[0], 10) || 0;
  const minutes = Number.parseInt(parts[1], 10) || 0;
  if (hours > 0 && minutes > 0) return `${hours} год ${minutes} хв`;
  if (hours > 0) return `${hours} год`;
  return `${minutes} хв`;
}

/** Дата для відображення */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}

/** Статус бронювання */
export function formatStatus(status) {
  const map = {
    scheduled: 'Заплановано',
    completed: 'Виконано',
    cancelled: 'Скасовано',
  };
  return map[status] || status;
}
