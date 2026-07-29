import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { buttonClasses, SPINNER_SIZE, type ButtonVariant, type ButtonSize } from './buttonStyles';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className = '', children, ...props },
  ref
) {
  return (
    <button ref={ref} disabled={disabled || loading} className={buttonClasses(variant, size, className)} {...props}>
      {loading && <Loader2 size={SPINNER_SIZE[size]} className="animate-spin" />}
      {children}
    </button>
  );
});

export default Button;
