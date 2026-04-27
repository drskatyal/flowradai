"use client"
import { Badge, BadgeProps } from "@/components/ui/badge";
import { TemplateCategory, TemplateType } from "@/interfaces";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { TemplateWithExtra } from "../chat/select-template";

interface TemplateBadgeGroupProps extends BadgeProps {
  template: TemplateWithExtra;
  showType?: boolean;
  showCategory?: boolean;
  titleLength?: number; // Optional prop to get title length from parent
}

const TemplateBadgeGroup = ({
  template,
  showType = true,
  showCategory = true,
  titleLength,
  className,
  ...props
}: TemplateBadgeGroupProps) => {
  const categoryContainerRef = useRef<HTMLDivElement>(null);
  const [isCategoryCollapsed, setIsCategoryCollapsed] = useState(false);
  
  // Check if we need to collapse category based on available space
  useEffect(() => {
    const checkSpace = () => {
      // If titleLength is provided explicitly, use that
      const effectiveTitleLength = titleLength || template.title.length;
      
      // Threshold for when to collapse category (can be adjusted)
      const threshold = effectiveTitleLength > 30 ? true : false;
      setIsCategoryCollapsed(threshold);
    };
    
    checkSpace();
    window.addEventListener('resize', checkSpace);
    return () => window.removeEventListener('resize', checkSpace);
  }, [template.title, titleLength]);

  const renderMostRelevantBadge = () => {
    if (!template?.similarity || template.similarity <= 0) return null;
  
    return (
      <Badge
        key="mostrelevant"
        variant="secondary"
        className={cn(
          "w-auto px-2 bg-purple-100 text-purple-800",
          className
        )}
        {...props}
      >
        MostRelevant
      </Badge>
    );
  };

  const renderTypeBadge = () => {
    const isPrivate = template.type === "private";
    return (
      <Badge
        key="type"
        variant="secondary"
        className={cn(
          "w-16",
          isPrivate
            ? "bg-blue-100 text-blue-800"
            : "bg-green-100 text-green-800",
          className
        )}
        {...props}
      >
        {isPrivate ? TemplateType.DEFAULT : TemplateType.PERSONAL}
      </Badge>
    );
  };

  const categoryTag = (category: any) => {
    switch (category) {
      case TemplateCategory.Normal:
        return "Normal";
      case TemplateCategory.AbNormal:
        return "Abnormal";
      default:
        return;
    }
  };

  const renderCategoryBadge = () => {
    // Define colors for both dot and badge background
    const colorMap: Record<TemplateCategory, { bg: string, dot: string }> = {
      [TemplateCategory.Normal]: { 
        bg: "bg-purple-100 text-purple-800", 
        dot: "bg-purple-500" 
      },
      [TemplateCategory.AbNormal]: { 
        bg: "bg-yellow-100 text-yellow-800", 
        dot: "bg-yellow-500" 
      },
    };

    const categoryStyle = colorMap[template.category as TemplateCategory] ?? {
      bg: "bg-muted text-muted-foreground",
      dot: "bg-gray-400"
    };
    
    if (!template.category) return null;
    
    return (
      <div 
        ref={categoryContainerRef}
        className="group relative cursor-pointer flex items-center"
      >
        {/* Color indicator dot - only visible when badge is collapsed */}
        {isCategoryCollapsed && (
          <div 
            className={cn(
              "h-2 w-2 rounded-full mr-1 transition-all duration-300",
              categoryStyle.dot,
              "group-hover:opacity-0" // Hide dot on hover when badge expands
            )}
          />
        )}
        
        {/* Expandable badge on hover */}
        <div 
          className={cn(
            "overflow-hidden whitespace-nowrap transition-all duration-300",
            isCategoryCollapsed 
              ? "max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100 group-hover:mr-2" 
              : "max-w-[100px] mr-2"
          )}
        >
          <Badge
            key="category"
            variant="secondary"
            className={cn(categoryStyle.bg, className)}
            {...props}
          >
            {categoryTag(template.category)}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center">
      {renderMostRelevantBadge()}
      {showCategory && renderCategoryBadge()}
      {showType && renderTypeBadge()}
    </div>
  );
};

export default TemplateBadgeGroup;
