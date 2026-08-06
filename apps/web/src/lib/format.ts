export function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return "$0.00";
  return `$${num.toFixed(2)}`;
}
