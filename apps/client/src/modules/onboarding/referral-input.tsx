import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

const ReferralCodeInput = ({
  referralCode,
  onChange,
  error,
}: {
  referralCode: string | null;
  onChange: (value: string) => void;
  error: string | null;
}) => (
  <>
    <InputOTP
      maxLength={6}
      pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
      onChange={onChange}
      value={referralCode || ""}
    >
      <InputOTPGroup className="my-0 mx-auto gap-1 md:gap-5">
        <InputOTPSlot index={0} className="border rounded-none first:rounded-none"/>
        <InputOTPSlot index={1} className="border"/>
        <InputOTPSlot index={2} className="border"/>
        <InputOTPSlot index={3} className="border"/>
        <InputOTPSlot index={4} className="border"/>
        <InputOTPSlot index={5} className="border rounded-none last:rounded-none"/>
      </InputOTPGroup>
    </InputOTP>
    {error && <p className="text-sm text-red-500 text-center mt-2">{error}</p>}
  </>
);

export default ReferralCodeInput;
