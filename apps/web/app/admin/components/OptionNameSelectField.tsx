'use client';

import React from 'react';
import { useField, useDocumentForm } from '@payloadcms/ui';

type OptionNameSelectFieldProps = {
  path: string;
  label?: string;
  required?: boolean;
  readOnly?: boolean;
};

export function OptionNameSelectField({
  path,
  label,
  required,
  readOnly,
}: OptionNameSelectFieldProps) {
  const { value, setValue, errorMessage, showError } = useField<string>({
    path: path || undefined,
  });
  const { getData } = useDocumentForm();
  const docData = getData();
  const optionsArray = (docData as { options?: { name?: string }[] } | undefined)?.options;
  const optionNames = React.useMemo(() => {
    const arr = Array.isArray(optionsArray) ? optionsArray : [];
    return arr
      .filter(
        (o): o is { name: string } =>
          typeof o?.name === 'string' && o.name.trim().length > 0
      )
      .map((o) => ({ label: o.name, value: o.name }));
  }, [optionsArray]);

  return (
    <div className="field-type select">
      {label != null && (
        <label className="field-label">
          {label}
          {required && ' *'}
        </label>
      )}
      <select
        className="input"
        value={value ?? ''}
        onChange={(e) => setValue(e.target.value || undefined)}
        disabled={readOnly}
        aria-invalid={showError}
      >
        <option value="">— Выберите опцию —</option>
        {optionNames.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {showError && errorMessage != null && (
        <span className="field-error">{errorMessage}</span>
      )}
    </div>
  );
}
