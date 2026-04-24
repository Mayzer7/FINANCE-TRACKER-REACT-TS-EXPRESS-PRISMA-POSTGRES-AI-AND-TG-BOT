export function formatCurrency(value: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

export function formatSignedCurrency(value: number): string {
  const sign = value >= 0 ? "+" : "−";
  return `${sign}${new Intl.NumberFormat("ru-RU").format(Math.abs(value))} ₽`;
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  }).format(new Date(value));
}

export function getFirstLetter(value: string): string {
  return value.trim().charAt(0).toUpperCase();
}
