// components/ui/custom-select.tsx
import React from "react"
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select"

interface Option {
  label: string
  value: string
  disabled?: boolean
}

interface CustomSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  className,
}) => {
  return (
    <div className={className}>
      {label && <label className="mb-1 block text-sm font-medium">{label}</label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="text-xs px-2 h-[36px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option, idx) =>
              option.value === "---" ? (
                <React.Fragment key={`sep-${idx}`}>
                  <SelectSeparator />
                </React.Fragment>
              ) : (
                <SelectItem
                  className="text-xs"
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              )
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

export default CustomSelect;
