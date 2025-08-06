import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

export function formatDate(date: string): string {
    return new Intl.DateTimeFormat('es-EC', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}


export function truncateFileName(fileName: string, maxLength = 12): string {
    const parts = fileName.split(".");
    if (parts.length < 2) return fileName;
    const extension = parts.pop();
    const base = parts.join(".");
    if (base.length <= maxLength) return `${base}.${extension}`;
    return `${base.slice(0, maxLength)}... .${extension}`;
}
  
export function formatDateSmart(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
  
    const isSameDay = (d1: Date, d2: Date): boolean =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  
    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";
  
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    return `${day} ${month}`;
}
  
export function formatFileSize(bytes: number): string {
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }
    return `${(kb / 1024).toFixed(2)} MB`;
}

export function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes'
  
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  
    const i = Math.floor(Math.log(bytes) / Math.log(k))
  
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm) + ' ' + sizes[i])
}
