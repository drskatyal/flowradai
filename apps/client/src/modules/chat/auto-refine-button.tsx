import { Sparkles } from "lucide-react";
import { Tooltip } from "@/components/customs";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AutoRefineButtonProps extends ButtonProps {
  autoRefine?: boolean;
  className?: string;
  panelSize: number;
}

export const AutoRefineButton: React.FC<AutoRefineButtonProps> = ({
  autoRefine,
  panelSize,
  ...props
}) => (
  <Tooltip
    trigger={
      <Button
        variant={autoRefine ? "default" : "outline"}
        type="button"
        size="sm"
        className={cn("border rounded-full !px-2", props.className)}
        {...props}
      >
        <Sparkles />
        {
          panelSize >= 33.33 &&
          <span className="hidden xl:block">
            Refine transcript
          </span>
        }
      </Button>
    }
  >
    <p>Refine transcript</p>
  </Tooltip>
);
