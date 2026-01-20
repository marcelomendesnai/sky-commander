import * as React from "react";
import { cn } from "@/lib/utils";

interface AtcCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

const AtcCard = React.forwardRef<HTMLDivElement, AtcCardProps>(
  ({ className, glow, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-border bg-card p-6",
        "relative overflow-hidden",
        glow && "shadow-atc-glow",
        className
      )}
      {...props}
    />
  )
);
AtcCard.displayName = "AtcCard";

const AtcCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3 mb-4", className)}
    {...props}
  />
));
AtcCardHeader.displayName = "AtcCardHeader";

const AtcCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-sm font-mono uppercase tracking-wider text-primary",
      className
    )}
    {...props}
  />
));
AtcCardTitle.displayName = "AtcCardTitle";

const AtcCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-4", className)} {...props} />
));
AtcCardContent.displayName = "AtcCardContent";

export { AtcCard, AtcCardHeader, AtcCardTitle, AtcCardContent };
