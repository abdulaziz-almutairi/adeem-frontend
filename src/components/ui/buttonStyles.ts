export type ButtonVariant = 'primary' | 'secondary' | 'outline-brand' | 'outline-danger' | 'solid-danger' | 'solid-success' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Single solid brand color for every primary action across the app (from the logo's
// dominant purple arm) - chosen over the decorative gradient for clickable controls so
// buttons read as one consistent, unmistakable "this is clickable" color everywhere.
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/30',
  secondary: 'bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300',
  'outline-brand': 'bg-white border-2 border-brand-200 text-brand-600 hover:bg-brand-50',
  'outline-danger': 'bg-white border-2 border-danger-200 text-danger-600 hover:bg-danger-50',
  'solid-danger': 'bg-danger-600 text-white shadow-md shadow-danger-500/20 hover:bg-danger-700',
  'solid-success': 'bg-success-500 text-white shadow-md shadow-success-500/20 hover:bg-success-600',
  ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-8 py-3.5 text-base rounded-2xl gap-2.5',
};

export const SPINNER_SIZE: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 20 };

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className = '') {
  return [
    'inline-flex items-center justify-center font-bold transition-all',
    'disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  ].join(' ');
}
