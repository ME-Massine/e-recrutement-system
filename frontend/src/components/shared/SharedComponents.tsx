import * as React from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  XIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// --- FormField ---

interface FormFieldProps {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, description, required, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="text-sm font-medium leading-none text-foreground">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}
      {children}
      {description && !error && (
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-xs leading-5 text-destructive">{error}</p>}
    </div>
  );
}

// --- StatCard ---

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  className?: string;
  colorClass?: string;
}

export function StatCard({ label, value, icon, className, colorClass }: StatCardProps) {
  return (
    <div className={cn("surface-card group p-4 transition-all duration-150 hover:-translate-y-0.5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[1.75rem] font-semibold leading-none tracking-tight text-foreground">{value}</p>
          <p className="mt-2 text-sm font-medium leading-5 text-muted-foreground">{label}</p>
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-md shadow-sm ring-1 ring-inset ring-border/70 transition-transform duration-150 group-hover:scale-105",
              colorClass ?? "bg-primary/10 text-primary"
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// --- PageHeader ---

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border/80 pb-7 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="max-w-2xl">
        <h1>{title}</h1>
        {description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// --- EmptyState ---

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border/90 bg-card/75 px-8 py-14 text-center shadow-inner shadow-slate-950/[0.025]",
        className
      )}
    >
      {icon && <div className="mb-4 text-muted-foreground/60">{icon}</div>}
      <h3 className="mb-1 text-base font-semibold">{title}</h3>
      {description && <p className="max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// --- Skeleton ---

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton h-4 rounded-md", className)} />;
}

// --- ErrorDisplay ---

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorDisplay({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
}: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/25 bg-destructive/5 px-6 py-12 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10 text-destructive">
        <AlertTriangleIcon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-destructive">{title}</h3>
      <p className="mb-4 mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

// --- InlineAlert ---

interface InlineAlertProps {
  type: "success" | "error";
  message: string;
}

export function InlineAlert({ type, message }: InlineAlertProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3.5 py-2.5",
        type === "success"
          ? "border-success/25 bg-success/10 text-success"
          : "border-destructive/25 bg-destructive/10 text-destructive"
      )}
    >
      {type === "success" ? (
        <CheckCircle2Icon className="h-4 w-4 shrink-0" />
      ) : (
        <AlertTriangleIcon className="h-4 w-4 shrink-0" />
      )}
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

// --- Modal ---

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({ open, onClose, title, children, footer, size = "md" }: ModalProps) {
  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const maxWidthClass = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-md";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="pointer-events-none absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className={cn(
          "relative z-10 flex w-full max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-lg border border-border/80 bg-card shadow-[0_20px_60px_hsl(222_38%_9%/0.18)] dark:shadow-[0_20px_60px_hsl(0_0%_0%/0.6)] animate-in",
          maxWidthClass
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border/80 px-5 py-4">
          <div className="text-base font-semibold text-foreground">{title}</div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-border/80 bg-muted/25 px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// --- ProfileRow ---

interface ProfileRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  isLink?: boolean;
  linkLabel?: string;
}

export function ProfileRow({ icon, label, value, isLink, linkLabel = "Open link" }: ProfileRowProps) {
  return (
    <div className="list-row flex items-start gap-3 p-3.5">
      <div className="icon-tile mt-0.5 h-8 w-8 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {isLink && value ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {linkLabel}
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </a>
        ) : (
          <p className="mt-0.5 text-sm font-medium break-all">{value || "Not provided"}</p>
        )}
      </div>
    </div>
  );
}

// --- QuickActionLink ---

interface QuickActionLinkProps {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

export function QuickActionLink({ label, description, href, icon }: QuickActionLinkProps) {
  return (
    <Link
      to={href}
      className="group flex items-center gap-3 rounded-lg border border-border/80 bg-card/90 p-3.5 shadow-[0_1px_2px_hsl(222_38%_9%/0.035)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_10px_24px_hsl(222_38%_9%/0.075)]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium transition-colors group-hover:text-primary">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRightIcon className="h-3.5 w-3.5 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
    </Link>
  );
}

// --- FormSection ---

interface FormSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, children, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {title && <p className="kicker">{title}</p>}
      {children}
    </div>
  );
}

// --- FormGrid ---

interface FormGridProps {
  children: React.ReactNode;
  cols?: 2 | 3;
  className?: string;
}

export function FormGrid({ children, cols = 2, className }: FormGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

// --- FormActions ---

interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function FormActions({ children, className }: FormActionsProps) {
  return (
    <div className={cn("flex items-center gap-3 border-t border-border/60 pt-4 mt-1", className)}>
      {children}
    </div>
  );
}

// --- AuthPageHeader ---

interface AuthPageHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthPageHeader({ icon, title, subtitle }: AuthPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col items-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_1px_2px_hsl(var(--primary)/0.25),0_12px_24px_hsl(var(--primary)/0.18)]">
        {icon}
      </div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
