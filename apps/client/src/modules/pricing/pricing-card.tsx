import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import { getReportLabel } from "@/helper";

interface PricingCardProps {
  title: string;
  range: number;
  price: string;
  features: string[];
  highlighted?: boolean;
  onSelect: () => void;
  isSelected: boolean;
  buyNow: React.ReactNode,
  currency: boolean;
  gst: number;
  subscription: string;
}

const PricingCard = ({
  title,
  range,
  price,
  features,
  highlighted = false,
  onSelect,
  isSelected,
  buyNow,
  currency = false,
  gst,
  subscription
}: PricingCardProps) => {
  return (
    <Card
      className={`relative transition-all hover:scale-105 ${isSelected
        ? "border-slate-800 shadow-lg shadow-slate-200"
        : highlighted
          ? "border-slate-400 shadow-md"
          : "border-slate-200"
        }`}
      onClick={onSelect}
    >
      <div className="flex flex-col justify-between gap-4 h-full">
        {highlighted && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <Badge className="bg-slate-800 whitespace-nowrap text-xs sm:text-sm">
              Limited Time Offer
            </Badge>
          </div>
        )}
        <div>
          <CardHeader className="text-center p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl mb-2">{title}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {getReportLabel(range, subscription)}
            </CardDescription>
            <div className="mt-4 text-2xl sm:text-4xl font-bold">
              {!currency ? '$' + price : '₹' + price}
            </div>
            {currency &&
              <div className="text-xs sm:text-sm">
                + {gst}% GST
              </div>
            }
          </CardHeader>
          <div className="flex justify-center p-4">
            {buyNow}
          </div>
          <CardContent className="p-4 sm:p-6">
            <ul className="space-y-3 sm:space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800 shrink-0 mt-1" />
                  <span className="text-xs sm:text-sm text-slate-600">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default PricingCard;
