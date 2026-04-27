import { Trash2, Edit, Eye } from "lucide-react";
import { Tooltip } from "@/components/customs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CouponCode } from "@/hooks/use-coupon-code";
import { CellContext } from "@tanstack/react-table";

interface CouponCodeActionsProps extends CellContext<CouponCode, unknown> {
  onToggleStatus?: (couponCode: CouponCode) => void;
  onEditCouponCode?: (couponCode: CouponCode) => void;
  onDeleteCouponCode?: (couponCode: CouponCode) => void;
  onViewDetails?: (couponCode: CouponCode) => void;
}

const CouponCodeActions: React.FC<CouponCodeActionsProps> = ({
  row,
  onToggleStatus,
  onEditCouponCode,
  onDeleteCouponCode,
  onViewDetails,
}) => {
  const couponCode = row.original;

  return (
    <div className="flex items-center justify-end gap-2">
      <Tooltip
        trigger={
          <div onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={couponCode.isActive}
              onCheckedChange={() => onToggleStatus?.(couponCode)}
            />
          </div>
        }
      >
        {couponCode.isActive ? "Deactivate" : "Activate"} coupon code
      </Tooltip>
      <Tooltip
        trigger={
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(couponCode);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        }
      >
        View details
      </Tooltip>
      <Tooltip
        trigger={
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEditCouponCode?.(couponCode);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        }
      >
        Edit coupon code
      </Tooltip>
      <Tooltip
        trigger={
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCouponCode?.(couponCode);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        }
      >
        Delete coupon code
      </Tooltip>
    </div>
  );
};

export default CouponCodeActions;