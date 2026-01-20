import * as React from "react";
import { cn } from "@/lib/utils";

export interface AtcInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  valid?: boolean;
}

const AtcInput = React.forwardRef<HTMLInputElement, AtcInputProps>(
  ({ className, label, error, valid, type, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-md border bg-input px-3 py-2 text-sm font-mono uppercase",
            "placeholder:text-muted-foreground/50 placeholder:normal-case",
            "focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-200",
            error
              ? "border-destructive focus:ring-destructive text-destructive"
              : valid
              ? "border-success focus:ring-success text-success"
              : "border-border focus:ring-primary text-foreground",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs font-mono text-destructive animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);
AtcInput.displayName = "AtcInput";

export { AtcInput };
