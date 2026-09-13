export type ReturnStatus = "vencido" | "proximo" | "em_dia";

const AVISO_DIAS = 10;

export function returnStatus(dateStr: string, today: Date): ReturnStatus {
  const due = new Date(dateStr + "T00:00:00");
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
  if (diffDays < 0) return "vencido";
  if (diffDays <= AVISO_DIAS) return "proximo";
  return "em_dia";
}

export function daysUntil(dateStr: string, today: Date): number {
  const due = new Date(dateStr + "T00:00:00");
  return Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
}
