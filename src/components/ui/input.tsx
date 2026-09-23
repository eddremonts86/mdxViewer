import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, type, ...props }, ref) => (
        <input
            type={type}
            className={cn(
                "border-rule bg-sky text-ink placeholder:text-ink-dim focus-visible:border-mark focus-visible:outline-mark rounded-plate flex h-9 w-full border px-3 py-2 text-[0.875rem] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-40",
                className
            )}
            ref={ref}
            {...props}
        />
    )
);
Input.displayName = "Input";

export { Input };
