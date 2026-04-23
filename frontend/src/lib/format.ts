const vndNumberFormatter = new Intl.NumberFormat("vi-VN");

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatCurrency(value: number): string {
  return `${vndNumberFormatter.format(value)}đ`;
}

export function formatDate(input: string | number | Date): string {
  return dateFormatter.format(new Date(input));
}

export function formatDateTime(input: string | number | Date): string {
  return dateTimeFormatter.format(new Date(input));
}
