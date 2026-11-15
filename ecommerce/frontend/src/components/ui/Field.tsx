import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

/** Underlined form fields in the site's mono style: eyebrow label above, dotted rule below. */
type Base = { label: string; id: string; hint?: string };

export function Field({ label, id, hint, className = '', ...rest }: Base & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={id} className="eyebrow block">
        {label}
      </label>
      <input id={id} {...rest} className="input" />
      {hint && <p className="mt-1 font-mono text-[11px] text-fg/70">{hint}</p>}
    </div>
  );
}

export function TextAreaField({ label, id, hint, className = '', ...rest }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={className}>
      <label htmlFor={id} className="eyebrow block">
        {label}
      </label>
      <textarea id={id} {...rest} className="input h-auto resize-none py-3 leading-6" />
      {hint && <p className="mt-1 font-mono text-[11px] text-fg/70">{hint}</p>}
    </div>
  );
}
