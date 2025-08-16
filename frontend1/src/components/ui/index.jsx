import React from "react";
import cx from "../../utils/cx";

export function Button({ children, className = "", ...props }) {
  return (
    <button {...props}
      className={cx(
        "rounded-xl bg-emerald-600 px-4 py-2 text-white font-medium shadow-sm hover:bg-emerald-500 active:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:ring-offset-2 focus:ring-offset-white transition",
        className
      )}
    >{children}</button>
  );
}

export function GhostButton({ children, className = "", ...props }) {
  return (
    <button {...props}
      className={cx(
        "rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:ring-offset-2 focus:ring-offset-white transition",
        className
      )}
    >{children}</button>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input {...props}
      className={cx(
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/70",
        className
      )}
    />
  );
}

export function Select({ className = "", ...props }) {
  return (
    <select {...props}
      className={cx(
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/70",
        className
      )}
    />
  );
}

export function Label({ children }) {
  return <label className="text-sm text-slate-600">{children}</label>;
}

export function Card({ title, value, subtitle, className = "" }) {
  return (
    <div className={cx("rounded-2xl bg-white border border-slate-200 p-4 shadow-sm", className)}>
      <div className="text-xs uppercase tracking-wider text-slate-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-slate-500">{subtitle}</div>}
    </div>
  );
}

export function Section({ title, children, right }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}
