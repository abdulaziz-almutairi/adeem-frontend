// صورة الطبيب، أو أول حرف من اسمه عند عدم وجود صورة
const SIZES = {
  sm: 'w-12 h-12 text-lg',
  md: 'w-16 h-16 text-2xl',
  lg: 'w-28 h-28 text-4xl',
} as const;

export default function DoctorAvatar({
  name,
  url,
  size = 'md',
}: {
  name: string;
  url?: string | null;
  size?: keyof typeof SIZES;
}) {
  const classes = `${SIZES[size]} shrink-0 rounded-full border-4 border-white shadow-md`;
  if (url) {
    return <img src={url} alt={`صورة ${name}`} className={`${classes} object-cover bg-slate-100`} />;
  }
  return (
    <div aria-hidden="true" className={`${classes} bg-brand-100 text-brand-700 font-bold flex items-center justify-center`}>
      {name.trim().charAt(0) || '؟'}
    </div>
  );
}
