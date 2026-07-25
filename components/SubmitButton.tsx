'use client';

import { useFormStatus } from 'react-dom';
import type { ButtonHTMLAttributes } from 'react';

export function SubmitButton({
  children,
  pendingText,
  className = 'btn btn-primary',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { pendingText?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      {...rest}
      type="submit"
      disabled={pending || rest.disabled}
      className={`${className} ${pending ? 'opacity-60 cursor-wait' : ''}`}
    >
      {pending ? pendingText ?? 'Working…' : children}
    </button>
  );
}
