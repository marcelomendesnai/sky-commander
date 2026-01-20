import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const atcButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono text-sm uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-atc-glow hover:shadow-atc-glow-lg",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary/10",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "text-muted-foreground hover:text-foreground hover:bg-muted/50",
        link:
          "text-primary underline-offset-4 hover:underline",
        record:
          "bg-atc-red text-white hover:bg-atc-red/90 shadow-[0_0_20px_hsl(var(--atc-red)/0.4)]",
        success:
          "bg-success text-success-foreground hover:bg-success/90 shadow-green-glow",
      },
      size: {
        default: "h-11 px-6 py-2 rounded-md",
        sm: "h-9 px-4 rounded-md text-xs",
        lg: "h-12 px-8 rounded-md",
        icon: "h-11 w-11 rounded-md",
        "icon-sm": "h-9 w-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface AtcButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof atcButtonVariants> {
  asChild?: boolean;
}

const AtcButton = React.forwardRef<HTMLButtonElement, AtcButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(atcButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
AtcButton.displayName = "AtcButton";

export { AtcButton, atcButtonVariants };
