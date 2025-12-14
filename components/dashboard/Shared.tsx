import React from "react";

export function CardShell({
  title,
  subtitle,
  right,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-9 w-9 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
              {icon}
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">
                {title}
              </div>
              {subtitle ? (
                <div className="mt-1 text-sm text-slate-500">{subtitle}</div>
              ) : null}
            </div>
          </div>
          {right ? (
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full shrink-0">
              {right}
            </div>
          ) : null}
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

export function KPI({
  title,
  value,
  sub,
  icon,
  theme,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  theme: any;
}) {
  return (
    <div
      className={`rounded-md border ${theme.border} bg-white shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-500">
            {title}
          </div>
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center ${theme.softAccentBg} ${theme.accentText}`}
          >
            {icon}
          </div>
        </div>
        <div className="mt-2 text-2xl font-extrabold text-slate-900 leading-none">
          {value}
        </div>
        <div className="mt-2 text-xs text-slate-500 font-semibold line-clamp-1">
          {sub}
        </div>
      </div>
    </div>
  );
}

export function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
        {label}
      </div>
      <div className="mt-1 text-sm font-extrabold text-slate-900">{value}</div>
    </div>
  );
}

export function EmptyBlock() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
      <div className="text-sm font-extrabold text-slate-900">No data yet</div>
      <div className="mt-1 text-sm text-slate-600">
        Search a place above to load weather, charts, and an AI travel plan.
      </div>
    </div>
  );
}
