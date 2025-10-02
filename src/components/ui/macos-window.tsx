import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface MacOSWindowProps {
  title: string;
  subtitle?: string;
  toolbar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function MacOSWindow({
  title,
  subtitle,
  toolbar,
  footer,
  children,
  className
}: MacOSWindowProps) {
  return (
    <section
      className={clsx(
        'relative flex w-full max-w-[1200px] flex-col overflow-hidden rounded-[22px] border border-white/70 bg-white/70 text-slate-900 shadow-[0_30px_80px_rgba(15,27,55,0.25)] backdrop-blur-[22px] transition-all dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-100',
        'ring-1 ring-black/5',
        className
      )}
    >
      <header className="flex flex-col gap-2 border-b border-white/60 px-6 pb-4 pt-5 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <TrafficLights />
          <div className="flex min-w-0 flex-col">
            <h1 className="truncate text-[17px] font-semibold tracking-[-0.01em]">
              {title}
            </h1>
            {subtitle ? (
              <p className="truncate text-sm text-slate-600 dark:text-slate-300">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {toolbar ? (
          <div className="flex flex-wrap items-center gap-3 rounded-[12px] border border-white/50 bg-white/60 px-3 py-2 text-sm shadow-[0_5px_15px_rgba(18,32,56,0.12)] transition dark:border-slate-800/70 dark:bg-slate-900/70">
            {toolbar}
          </div>
        ) : null}
      </header>
      <div className="grid gap-6 bg-white/50 px-6 py-6 text-sm leading-relaxed tracking-[-0.01em] dark:bg-slate-950/40 sm:px-8 sm:py-8">
        {children}
      </div>
      {footer ? (
        <footer className="border-t border-white/70 bg-white/70 px-6 py-4 text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-300">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}

export function TrafficLights() {
  return (
    <div className="flex items-center gap-[6px]">
      <span
        className="h-[12px] w-[12px] rounded-full bg-[#ff5f56] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.2)]"
        aria-hidden
      />
      <span
        className="h-[12px] w-[12px] rounded-full bg-[#ffbd2e] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.2)]"
        aria-hidden
      />
      <span
        className="h-[12px] w-[12px] rounded-full bg-[#27c93f] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.2)]"
        aria-hidden
      />
    </div>
  );
}
