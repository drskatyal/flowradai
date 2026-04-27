"use client";
import {
  AsyncSelect,
  AsyncSelectProps,
} from "@/components/ui/customs/async-select";
import CustomSelect from "@/components/ui/customs/select";
import { Template } from "@/hooks/use-template-handler";
import { cn } from "@/lib/utils";
import { TemplateTypeBadge } from "../template";
import { useSelectTemplate } from "./hooks/use-select-template";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRef, useEffect, useState } from "react";
import { useStore } from "@/stores";

// Extend with your own key
export interface TemplateWithExtra extends Template {
  similarity?: number;  // <-- your extra field
}

interface SelectTemplateProps extends Partial<AsyncSelectProps<Template>> {
  templates: Template[];
  onTemplateSelect?: (template: Template | null) => void;
  isDisabled?: boolean;
  listOpen?: boolean;
  setListOpen: ((value: boolean) => void | undefined) | undefined
}

const SelectTemplate = ({
  templates,
  onTemplateSelect,
  isDisabled,
  triggerClassName,
  listOpen,
  setListOpen,
  isCustom,
  ...props
}: SelectTemplateProps) => {
  const {
    fetchTemplateOptions,
    handleTemplateSelect,
    selectedTemplate,
    options,
    selected,
    setSelected,
    privacyOptions,
    setSelectedPrivacy,
    selectedPrivacy
  } = useSelectTemplate(templates, onTemplateSelect);

  const [titleLength, setTitleLength] = useState(0);
  const titleRef = useRef<HTMLDivElement>(null);
  const user = useStore((state) => state.user);

  // Measure the title's text width to determine if badges should collapse
  useEffect(() => {
    if (titleRef.current && selectedTemplate) {
      setTitleLength(selectedTemplate.title.length);
    }
  }, [selectedTemplate]);

  return (
    <TooltipProvider>
      <AsyncSelect
        listOpen={listOpen}
        setListOpen={(value) => setListOpen?.(value)}
        isCustom={isCustom}
        key={selectedTemplate?._id}
        fetcher={fetchTemplateOptions}
        renderOption={(template: Template) => (
          <div className="grid grid-rows-1 w-full gap-2">
            <div className="grid grid-cols-[1fr_auto] gap-2 items-center max-xs:grid-cols-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    ref={titleRef}
                    className={`w-full inline-block overflow-hidden text-ellipsis text-nowrap cursor-pointer`}
                  >
                    {template.title}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {template.title}
                </TooltipContent>
              </Tooltip>
              <TemplateTypeBadge
                template={template}
                className="text-[10px] rounded-full h-4"
                titleLength={titleLength}
              />
            </div>
          </div>
        )}
        getOptionValue={(template: Template) => template._id}
        getDisplayValue={(template: Template) => template.title}
        value={selectedTemplate?._id || ""}
        onChange={handleTemplateSelect}
        placeholder="Select a template..."
        label="Template"
        triggerClassName={cn("w-full min-w-[80px]", triggerClassName)}
        className="w-[var(--radix-popover-trigger-width)]"
        commandItemClassName="group items-start max-xs:gap-[1px] max-xs:p-1"
        disabled={isDisabled}
        {...props}
        commandInputParentClassName="flex justify-between p-1 gap-1"
        commandInputClassName="h-8"
        serachInputClassName=""
      >
        <div className="flex items-center gap-2 w-full">
          <CustomSelect
            options={options}
            value={selected}
            onChange={setSelected}
            placeholder="Choose category.."
            className="w-full"
          />
          <CustomSelect
            options={privacyOptions}
            value={selectedPrivacy}
            onChange={setSelectedPrivacy}
            placeholder="Choose.."
            className="w-full"
          />
        </div>
      </AsyncSelect>
    </TooltipProvider>
  );
};

export default SelectTemplate;