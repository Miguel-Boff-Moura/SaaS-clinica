/** Data de referência do protótipo — "hoje" no ambiente de demonstração. */
export const TODAY = new Date(2026, 7, 30); // 30/08/2026 (sábado)

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // segunda = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
const BRL_CENTS = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function currency(value: number, cents = false): string {
  return (cents ? BRL_CENTS : BRL).format(value);
}

export function compactCurrency(value: number): string {
  if (Math.abs(value) >= 1000) return `R$ ${(value / 1000).toFixed(1).replace(".", ",")}k`;
  return currency(value);
}

export function shortDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function mediumDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
}

export function fullDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function monthYear(date: Date): string {
  return date
    .toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    .replace(".", "");
}

export function longDate(date: Date): string {
  const s = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function time(date: Date): string {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function relativeFromToday(date: Date): string {
  const diff = Math.round((date.getTime() - TODAY.getTime()) / 86_400_000);
  if (diff === 0) return "hoje";
  if (diff === 1) return "amanhã";
  if (diff === -1) return "ontem";
  if (diff < 0) return `há ${Math.abs(diff)} dias`;
  return `em ${diff} dias`;
}

export function age(birth: Date): number {
  let a = TODAY.getFullYear() - birth.getFullYear();
  const m = TODAY.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && TODAY.getDate() < birth.getDate())) a--;
  return a;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter((p) => p.length > 2 || p === name.split(" ")[0])
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function firstName(name: string): string {
  return name.replace(/^(Dra?\.?|Sr\.?|Sra\.?)\s+/i, "").split(" ")[0];
}

export function pct(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}
