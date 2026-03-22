import { formatInTimeZone } from 'date-fns-tz';

export const IST_TIMEZONE = 'Asia/Kolkata';

export function getISTTime() {
  return new Date();
}

export function formatIST(date: Date, formatStr: string) {
  return formatInTimeZone(date, IST_TIMEZONE, formatStr);
}

export function isMarketClosed() {
  const now = new Date();
  const istTime = new Date(formatInTimeZone(now, IST_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"));
  
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  
  // Market closes at 15:30 IST
  if (hours > 15 || (hours === 15 && minutes >= 30)) {
    return true;
  }
  
  // Market opens at 09:15 IST
  if (hours < 9 || (hours === 9 && minutes < 15)) {
    return true;
  }
  
  return false;
}
