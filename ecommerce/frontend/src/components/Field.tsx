import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

/** Compact labelled inputs: small label above, 36px control. */
const control =
  'w-full rounded-md border border-line bg-white px-3 text-[13px] text-ink outline-none transition placeholder:text-mute/60 ' +
  'focus:border-ink focus:ring-2 focus:ring-ink/10 disabled:opacity-50';
const labelCls = 'mb-1 block text-xs font-medium text-mute';

type Base = { label: string; id: string };

export function Field({ label, id, className = '', ...rest }: Base & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <input id={id} {...rest} className={`${control} h-9`} />
    </div>
  );
}

export function TextAreaField({ label, id, className = '', ...rest }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <textarea id={id} {...rest} className={`${control} resize-none py-2`} />
    </div>
  );
}
