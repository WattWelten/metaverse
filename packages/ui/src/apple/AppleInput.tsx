import { CSSProperties, InputHTMLAttributes } from 'react';

interface AppleInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'style'> {
  style?: CSSProperties;
  className?: string;
}

export function AppleInput({ style, className = '', ...props }: AppleInputProps) {
  return <input className={`input-apple ${className}`} style={style} {...props} />;
}
