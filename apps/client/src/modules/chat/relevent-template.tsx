import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Star } from "lucide-react";
import { TemplateWithExtra } from "./select-template";
import { Tooltip } from "@/components/customs";
interface TemplateListProps {
  templates: TemplateWithExtra[];
  onClick?: (template: TemplateWithExtra) => void;
}

export default function AiSuggestedTemplates({ templates, onClick }: TemplateListProps) {
  const handleTemplateSelect = (template: TemplateWithExtra) => {
    onClick?.(template);
  }
  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm rounded-2xl border border-blue-100">
      <div className="flex items-center mb-3">
        <Bot className="w-4 h-4 text-indigo-500 mr-2 shrink-0" />
        <h3 className="text-sm font-semibold text-gray-700">
          AI Suggested Templates
        </h3>
        <Badge
          variant="secondary"
          className="ml-2 bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5"
        >
          Smart Match
        </Badge>
      </div>

      {/* Friendly note */}
      <p className="text-xs text-gray-500 mb-3">
        Recommended based on your input
      </p>

      {/* List */}
      <div className="space-y-2">
        {templates.map((template: any, idx: any) => (
          <Tooltip
            trigger={
              <div
                key={template._id}
                onClick={() => handleTemplateSelect(template)}
                className={`flex flex-wrap md:flex-nowrap items-center justify-between gap-2 p-2 rounded-xl shadow-sm border transition cursor-pointer
              ${idx === 0
                    ? "bg-indigo-50 border-indigo-200 hover:bg-indigo-100 hover:scale-[1.02]"
                    : "bg-white border-gray-100 hover:bg-indigo-50 hover:scale-[1.02]"}`}
              >
                {/* Left Section */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {template.title}
                  </span>
                  {idx === 0 && (
                    <Badge className="bg-black text-white text-[10px] px-1.5 py-0.5 flex items-center gap-1 shrink-0">
                      <Star className="w-3 h-3" /> Recommended
                    </Badge>
                  )}
                </div>

                {/* Right Section */}
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 shrink-0"
                >
                  {(template.similarity * 100).toFixed(2)}%
                </Badge>
              </div>
            }
          >

            {template.title}
          </Tooltip>
        ))}
      </div>
    </Card>
  );
}
