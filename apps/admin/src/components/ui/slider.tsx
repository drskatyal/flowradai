"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number
  min?: number
  max?: number
  step?: number
  onValueChange: (value: number) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, min = 0, max = 1, step = 0.1, onValueChange, ...props }, ref) => {
    return (
      <div className="relative flex w-full touch-none select-none items-center py-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onValueChange(parseFloat(e.target.value))}
          className={cn(
            "h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary transition-all hover:accent-primary/80 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
        <div className="ml-4 min-w-[3rem] text-sm font-medium tabular-nums text-foreground">
          {value.toFixed(1)}
        </div>
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
