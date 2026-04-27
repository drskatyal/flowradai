"use client"

import * as React from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface UiSwitchProps {
    id?: string
    label?: string
    description?: string
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    disabled?: boolean
    className?: string
}

export const ToggleSwitch: React.FC<UiSwitchProps> = ({
    id,
    label,
    description,
    checked,
    onCheckedChange,
    disabled = false,
    className = "",
}) => {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <div className="flex items-center justify-between">
                <Label htmlFor={id} className="text-sm text-white">
                    {label}
                </Label>
                <Switch
                    id={id}
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                    disabled={disabled}
                />
            </div>
            {description && (
                <p className="text-xs text-muted-foreground text-gray-400 ml-[2px]">
                    {description}
                </p>
            )}
        </div>
    )
}
