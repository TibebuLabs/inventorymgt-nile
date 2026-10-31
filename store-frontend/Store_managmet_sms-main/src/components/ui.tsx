import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimes,
  FaSpinner,
  FaInbox,
  FaExclamationTriangle,
} from "react-icons/fa";
import { cn } from "../lib/format";
import type { Tone } from "../lib/format";

export { cn } from "../lib/format";

/* ── helpers ─────────────────────────────────────────────────────────────── */

const TONE_SOFT: Record<Tone, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/30",
  green:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
  amber:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30",
  red: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30",
  slate:
    "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-700/60 dark:text-slate-300 dark:ring-slate-600",
  violet:
    "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/30",
};

const TONE_SOLID: Record<Tone, string> = {
  blue: "bg-blue-600 text-white",
  green: "bg-emerald-600 text-white",
  amber: "bg-amber-500 text-white",
  red: "bg-red-600 text-white",
  slate: "bg-slate-600 text-white",
  violet: "bg-violet-600 text-white",
};

/* ── Card ────────────────────────────────────────────────────────────────── */

export const Card = ({
  children,
  className,
  padded = true,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  hover?: boolean;
}) => (
  <div
    className={cn(
      "rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40",
      "dark:border-slate-700/80 dark:bg-slate-800 dark:shadow-none transition-all duration-300",
      hover && "hover:shadow-xl hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20",
      padded && "p-6",
      className
    )}
  >
    {children}
  </div>
);

/* ── Page header ─────────────────────────────────────────────────────────── */

export const PageHeader = ({
  title,
  description,
  actions,
  icon,
  badge,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
}) => (
  <div className={cn(
    "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8",
    "pb-4 border-b border-slate-200 dark:border-slate-700"
  )}>
    <div className="flex items-start gap-3">
      {icon && (
        <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
          {icon}
        </div>
      )}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

/* ── Badge ───────────────────────────────────────────────────────────────── */

export const Badge = ({
  tone = "slate",
  children,
  className,
  dot,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
      TONE_SOFT[tone],
      className
    )}
  >
    {dot && <span className={cn("h-2 w-2 rounded-full", TONE_SOLID[tone])} />}
    {children}
  </span>
);

/* ── Button ──────────────────────────────────────────────────────────────── */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 shadow-sm shadow-blue-600/20 transition-all",
  secondary:
    "bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600 dark:hover:bg-slate-700 transition-all",
  ghost:
    "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/60 transition-all",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm shadow-red-600/20 transition-all",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 shadow-sm shadow-emerald-600/20 transition-all",
  outline:
    "border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = ({
  variant = "primary",
  size = "md",
  loading,
  icon,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) => (
  <button
    {...rest}
    disabled={disabled || loading}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900",
      "disabled:cursor-not-allowed disabled:opacity-60",
      size === "sm" ? "px-3 py-1.5 text-xs" : size === "lg" ? "px-6 py-3 text-base" : "px-5 py-2.5 text-sm",
      BUTTON_VARIANTS[variant],
      className
    )}
  >
    {loading ? <FaSpinner className="animate-spin" /> : icon}
    {children}
  </button>
);

/* ── Form controls ───────────────────────────────────────────────────────── */

const CONTROL =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 " +
  "transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 " +
  "dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder-slate-500";

export const Input = ({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) => (
  <input {...rest} className={cn(CONTROL, className)} />
);

export const Textarea = ({
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...rest} className={cn(CONTROL, "min-h-[100px] resize-y", className)} />
);

export const Select = ({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...rest} className={cn(CONTROL, "pr-10 appearance-none", className)} />
);

export const Field = ({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn("mb-4", className)}>
    {label && (
      <div className="flex items-center gap-1.5 mb-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </label>
        {required && <span className="text-red-500 text-[10px]">*</span>}
      </div>
    )}
    {children}
    {hint && !error && (
      <span className="mt-1 block text-xs text-slate-400 dark:text-slate-500">{hint}</span>
    )}
    {error && (
      <div className="mt-2 flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-400">
        <FaExclamationCircle className="h-3 w-3" /> {error}
      </div>
    )}
  </div>
);

/* ── Stat card ───────────────────────────────────────────────────────────── */

export const StatCard = ({
  label,
  value,
  hint,
  icon,
  tone = "blue",
  trend,
  loading,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  trend?: { direction: "up" | "down"; value: number; label: string };
  loading?: boolean;
}) => {
  const trendColor =
    trend?.direction === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-red-600 dark:text-red-400";
  return (
    <Card className="relative overflow-hidden group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {label}
            </p>
            {trend && (
              <span className={cn("text-xs font-medium", trendColor)}>
                {trend.direction === "up" ? "↑" : "↓"} {trend.value}{trend.label}
              </span>
            )}
          </div>
          {loading ? (
            <Skeleton className="mt-2 h-10 w-32" />
          ) : (
            <p className="mt-2 truncate text-3xl font-bold text-slate-900 dark:text-white">
              {value}
            </p>
          )}
          {hint && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl",
              TONE_SOFT[tone],
              "group-hover:scale-110 transition-transform"
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

/* ── Skeletons / empty states ────────────────────────────────────────────── */

export const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-700/70",
      className
    )}
  />
);

export const Spinner = ({ className }: { className?: string }) => (
  <FaSpinner
    className={cn("animate-spin text-blue-600 dark:text-blue-400", className)}
  />
);

export const LoadingBlock = ({ label = "Loading…" }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400 dark:text-slate-500">
    <Spinner className="text-3xl" />
    <p className="text-sm">{label}</p>
  </div>
);

export const EmptyState = ({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400 dark:bg-slate-700/60 dark:text-slate-500">
      {icon ?? <FaInbox />}
    </div>
    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
      {title}
    </h3>
    {description && (
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

/* ── Table ───────────────────────────────────────────────────────────────── */

export const TableWrap = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("overflow-x-auto", className)}>{children}</div>
);

export const Table = ({ children, className }: { children: ReactNode; className?: string }) => (
  <table className={cn("w-full border-collapse text-left text-sm", className)}>
    {children}
  </table>
);

export const Th = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <th
    className={cn(
      "whitespace-nowrap border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400",
      className
    )}
  >
    {children}
  </th>
);

export const Td = ({
  children,
  className,
  colSpan,
}: {
  children?: ReactNode;
  className?: string;
  colSpan?: number;
}) => (
  <td
    colSpan={colSpan}
    className={cn(
      "border-b border-slate-100 px-4 py-3 text-slate-700 dark:border-slate-700/60 dark:text-slate-300",
      className
    )}
  >
    {children}
  </td>
);

export const Tr = ({ children, className }: { children: ReactNode; className?: string }) => (
  <tr className={cn("transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-700/30", className)}>
    {children}
  </tr>
);

/* ── Tabs ────────────────────────────────────────────────────────────────── */

export const Tabs = <T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
}) => (
  <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
          value === tab.id
            ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        )}
      >
        {tab.label}
        {typeof tab.count === "number" && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold",
              value === tab.id
                ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
            )}
          >
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

/* ── Modal ───────────────────────────────────────────────────────────────── */

export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  const width =
    size === "sm"
      ? "max-w-md"
      : size === "lg"
        ? "max-w-3xl"
        : size === "xl"
          ? "max-w-[900px]"
          : "max-w-xl";

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:rounded-3xl",
          "dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700",
          width,
          "animate-[fadeSlideIn_0.2s_ease_both]"
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-700">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-700 dark:bg-slate-900/30">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

/* ── Progress bar ────────────────────────────────────────────────────────── */

export const ProgressBar = ({
  value,
  tone = "blue",
  className,
}: {
  value: number;
  tone?: Tone;
  className?: string;
}) => (
  <div className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700", className)}>
    <div
      className={cn("h-full rounded-full transition-all duration-500", TONE_SOLID[tone])}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

/* ── Toasts ──────────────────────────────────────────────────────────────── */

type ToastKind = "success" | "error" | "info" | "warning";
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastApi | undefined>(undefined);

export const useToast = (): ToastApi => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within <ToastProvider>");
  return context;
};

const TOAST_STYLE: Record<ToastKind, string> = {
  success: "border-emerald-200 bg-white text-emerald-800 dark:border-emerald-500/40 dark:bg-slate-800 dark:text-emerald-300",
  error: "border-red-200 bg-white text-red-800 dark:border-red-500/40 dark:bg-slate-800 dark:text-red-300",
  info: "border-blue-200 bg-white text-blue-800 dark:border-blue-500/40 dark:bg-slate-800 dark:text-blue-300",
  warning: "border-amber-200 bg-white text-amber-800 dark:border-amber-500/40 dark:bg-slate-800 dark:text-amber-300",
};

const TOAST_ICON: Record<ToastKind, ReactNode> = {
  success: <FaCheckCircle />,
  error: <FaExclamationCircle />,
  info: <FaInfoCircle />,
  warning: <FaExclamationTriangle />,
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current.slice(-3), { id, kind, message }]);
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, 5000);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      info: (message) => push("info", message),
      warning: (message) => push("warning", message),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[200] flex flex-col items-center gap-3 px-4 sm:bottom-8">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-5 py-4 text-sm font-medium shadow-xl",
                "animate-[slide-up-toast_0.3s_ease-out_both]",
                TOAST_STYLE[item.kind]
              )}
            >
              <span className="mt-0.5 shrink-0">{TOAST_ICON[item.kind]}</span>
              <span className="flex-1">{item.message}</span>
              <button
                onClick={() => setItems((current) => current.filter((i) => i.id !== item.id))}
                className="shrink-0 opacity-60 transition hover:opacity-100"
                aria-label="Dismiss"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};
