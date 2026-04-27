import React from 'react';
import {
  TooltipContentProps,
  TooltipProps as UiTooltipProps,
  TooltipProviderProps,
  TooltipTriggerProps,
} from '@radix-ui/react-tooltip';
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface TooltipStyles {
  content?: string;
  trigger?: string;
}

interface TooltipProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  classNames?: TooltipStyles;
  tooltipProviderProps?: TooltipProviderProps;
  tooltipProps?: UiTooltipProps;
  tooltipTriggerProps?: TooltipTriggerProps;
  tooltipContentProps?: TooltipContentProps;
}

export const Tooltip = ({
  trigger,
  children,
  classNames,
  tooltipProps,
  tooltipTriggerProps,
  tooltipContentProps,
  tooltipProviderProps,
}: TooltipProps) => (
  <TooltipProvider {...tooltipProviderProps}>
    <UiTooltip {...tooltipProps}>
      <TooltipTrigger
        className={classNames?.trigger}
        asChild
        {...tooltipTriggerProps}
      >
        {trigger}
      </TooltipTrigger>
      <TooltipContent className={classNames?.content} {...tooltipContentProps}>
        {children}
      </TooltipContent>
    </UiTooltip>
  </TooltipProvider>
);
