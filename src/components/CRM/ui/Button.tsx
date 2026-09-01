import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  isSuccess?: boolean;
  loadingText?: string;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  isSuccess = false,
  loadingText,
  className = '',
  disabled,
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-bold text-[13px] rounded transition-colors tracking-wide outline-none';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90 active:scale-[0.98]',
    secondary: 'bg-surface-muted text-on-surface hover:bg-border-subtle active:scale-[0.98]',
    danger: 'bg-status-na text-white hover:bg-status-na/90 active:scale-[0.98]',
    ghost: 'bg-transparent text-on-surface-variant hover:bg-surface-muted',
    outline: 'border border-border-subtle text-on-surface hover:bg-surface-muted active:scale-[0.98]'
  };

  const disabledClasses = (disabled || isLoading || isSuccess) ? 'opacity-60 cursor-not-allowed pointer-events-none' : '';
  const paddingClasses = variant === 'ghost' ? 'px-3 py-1.5' : 'px-4 py-2';
  
  const successClasses = isSuccess ? '!bg-green-500 !text-white !border-green-500' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${paddingClasses} ${successClasses} ${className}`}
      disabled={disabled || isLoading || isSuccess}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingText || children}
        </>
      ) : isSuccess ? (
        <>
          <span className="material-symbols-outlined text-[18px] mr-2">check</span>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
