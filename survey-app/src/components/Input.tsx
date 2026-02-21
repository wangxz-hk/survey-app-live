import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, ...props }, ref) => {
        return (
            <div className={`input-group ${className}`}>
                {label && <label className="input-label">{label}</label>}
                <input ref={ref} className="input" {...props} />
                {error && <span className="text-sm text-red-500 mt-1">{error}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';
