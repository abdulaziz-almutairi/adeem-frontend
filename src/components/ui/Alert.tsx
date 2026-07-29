import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export type AlertVariant = 'danger' | 'success' | 'warning' | 'info';

const CONFIG: Record<AlertVariant, { classes: string; Icon: typeof AlertCircle }> = {
  danger: { classes: 'bg-danger-50 border-danger-200 text-danger-600', Icon: AlertCircle },
  success: { classes: 'bg-success-50 border-success-200 text-success-700', Icon: CheckCircle2 },
  warning: { classes: 'bg-warning-50 border-warning-200 text-warning-700', Icon: AlertTriangle },
  info: { classes: 'bg-brand-50 border-brand-100 text-brand-700', Icon: Info },
};

export default function Alert({
  variant = 'danger',
  children,
  className = '',
}: {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}) {
  const { classes, Icon } = CONFIG[variant];
  return (
    <div className={`p-3 rounded-xl border text-sm font-semibold flex items-start gap-2 ${classes} ${className}`}>
      <Icon size={18} className="shrink-0 mt-0.5" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
