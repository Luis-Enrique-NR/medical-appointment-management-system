import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("es-PE", {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });
}

export function getMonthYear(d: Date) {
  const months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

const DAYS_SHORT = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
export { DAYS_SHORT };

export function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
