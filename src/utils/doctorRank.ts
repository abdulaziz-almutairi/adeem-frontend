import type { DoctorRank } from '../types';

// المسمى المهني كما يظهر للمرضى والأطباء
export const RANK_LABELS: Record<DoctorRank, string> = {
  GENERAL_PRACTITIONER: 'طبيب عام',
  SPECIALIST: 'أخصائي',
  CONSULTANT: 'استشاري',
};

export function rankLabel(rank?: DoctorRank | null): string | null {
  return rank ? RANK_LABELS[rank] : null;
}

// "١ سنة" لا تُقال؛ نستخدم صيغ العدد العربية الصحيحة
export function experienceLabel(years?: number | null): string | null {
  if (years === null || years === undefined) return null;
  if (years === 0) return 'أقل من سنة خبرة';
  if (years === 1) return 'سنة خبرة واحدة';
  if (years === 2) return 'سنتان من الخبرة';
  if (years <= 10) return `${years} سنوات خبرة`;
  return `${years} سنة خبرة`;
}
