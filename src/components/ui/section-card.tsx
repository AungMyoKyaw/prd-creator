import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface SectionCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className
}: SectionCardProps) {
  return (
    <article
      className={clsx(
        'flex flex-col gap-4 rounded-[18px] border border-white/70 bg-white/70 p-5 shadow-[0_20px_45px_rgba(15,27,55,0.12)] transition hover:border-white/90 dark:border-slate-800/70 dark:bg-slate-900/60',
        'backdrop-blur-[18px]',
        className
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          {description ? (
            <p className="max-w-prose text-sm text-slate-600 dark:text-slate-300">
              {description}
            </p>
          ) : null}
        </div>
        {action ? (
          <div className="flex items-center gap-2">{action}</div>
        ) : null}
      </header>
      <div className="grid gap-3 text-sm text-slate-700 dark:text-slate-200">
        {children}
      </div>
    </article>
  );
}
