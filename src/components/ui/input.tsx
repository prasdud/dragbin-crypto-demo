import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-mono text-sm pointer-events-none select-none">&gt;</span>
        <input
          type={type}
          className={cn(
            "flex h-10 w-full bg-input border border-input px-3 pl-8 py-2 text-base md:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 font-mono tracking-wide cyber-chamfer-sm transition-all focus:neon-glow",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
