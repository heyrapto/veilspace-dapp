import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "cursor-pointer flex justify-center gap-2 items-center  h-10 px-3.5 text-white text-[13px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default:
          "rounded-[var(--radius-10,10px)] border border-[rgba(255,255,255,0.12)] btn-default hover:opacity-90 active:scale-[0.98]",
        destructive:
          "rounded-[var(--radius-10,10px)] bg-red-500 text-gray-50 hover:bg-red-500/90 hover:shadow-lg active:scale-[0.98]",
        outline:
          "border border-gray-200 bg-none hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300 active:scale-[0.98]",
        secondary:
          "border border-white/8 bg-[#242424] hover:bg-[#242424]/80 hover:shadow-lg active:scale-[0.98]",
        ghost: "hover:bg-gray-100 hover:text-gray-900 active:scale-[0.98]",
        ghostly: "hover:bg-transparent active:scale-[0.98]",
        link: "text-gray-900 underline-offset-4 hover:underline active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-3.5",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  image?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      isLoading,
      loadingText = "Loading...",
      size,
      asChild = false,
      icon,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {loadingText}
          </>
        ) : (
          <div className="flex justify-center items-center gap-2">
            {props.children} {icon && icon}
          </div>
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };