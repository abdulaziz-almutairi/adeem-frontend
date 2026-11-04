// المنطقة الزمنية للعيادة (PO-15): مواعيد الأطباء بتوقيت الرياض، فلا نعتمد على منطقة متصفح المريض
export const CLINIC_TIME_ZONE = 'Asia/Riyadh';

// تاريخ اليوم في منطقة العيادة بصيغة YYYY-MM-DD (المطلوبة لحقل input type="date")
export function clinicTodayISO(now: Date = new Date(), timeZone: string = CLINIC_TIME_ZONE): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}
