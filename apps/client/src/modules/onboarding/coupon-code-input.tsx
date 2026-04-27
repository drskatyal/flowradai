"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CouponCodeInputProps {
    couponCode: string | null;
    onChange: (value: string) => void;
    onSkip?: () => void;
    onApply?: () => void;
    isApplying?: boolean;
}

const CouponCodeInput: React.FC<CouponCodeInputProps> = ({
    couponCode,
    onChange,
    onSkip,
    onApply,
    isApplying,
}) => {
    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode || ""}
                    onChange={(e) => onChange(e.target.value.toUpperCase())}
                    maxLength={8}
                    className="uppercase font-mono"
                />
            </div>
            <p className="text-xs text-muted-foreground">
                The coupon code will be validated and applied after your account is
                created.
            </p>
            {(onSkip || onApply) && (
                <div className="flex gap-2">
                    {onSkip && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onSkip}
                            disabled={isApplying}
                            className="flex-1"
                        >
                            Skip
                        </Button>
                    )}
                    {onApply && (
                        <Button
                            type="button"
                            onClick={onApply}
                            disabled={!couponCode || couponCode.length !== 8 || isApplying}
                            className="flex-1"
                        >
                            {isApplying ? "Processing..." : "Continue with Coupon"}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CouponCodeInput;