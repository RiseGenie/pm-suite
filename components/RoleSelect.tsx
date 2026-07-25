'use client';

import { useRef } from 'react';
import { useFormStatus } from 'react-dom';

function StatusHint() {
  const { pending } = useFormStatus();
  return pending ? <span className="text-xs text-muted">Saving…</span> : null;
}

export function RoleSelect({
  action,
  currentRole,
  options,
  disabled,
  fieldName = 'role',
}: {
  action: (formData: FormData) => void;
  currentRole: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  fieldName?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action} className="flex items-center gap-2">
      <select
        name={fieldName}
        defaultValue={currentRole}
        disabled={disabled}
        onChange={() => formRef.current?.requestSubmit()}
        className="input text-xs py-1 w-auto disabled:opacity-50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <StatusHint />
    </form>
  );
}
