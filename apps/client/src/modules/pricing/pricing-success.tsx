"use client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils";
import { useUser } from "@clerk/nextjs";
import { CircleCheckIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ExtendedUserPublicMetadata } from "../home/navbar";

const PricingSuccess = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const payment = (user?.publicMetadata as ExtendedUserPublicMetadata)?.payment;

  useEffect(() => {
    if (isLoaded && !payment) {
      router.replace("/");
    }
  }, [payment, isLoaded]);

  const amountPaid = payment?.paymentAmount;
  const threadsQuantity = payment?.threadsQuantity;
  const paymentType = payment?.paymentType;
  const paymentCreatedAt = formatDate(payment?.paymentCreatedAt || "");
  const paymentId = payment?.paymentId;
  const currency = payment?.currency;
  const planName = payment?.planName;

  const paymentDetails = [
    { label: "Payment ID", value: paymentId },
    { label: "Plan", value: planName || (threadsQuantity !== 0 ? `${threadsQuantity} Reports` : "Unlimited") },
    { label: "Threads Purchased", value: threadsQuantity !== 0 ? threadsQuantity : "Unlimited" },
    { label: "Amount Paid", value: currency === "USD" ? `$${amountPaid}` : `₹${amountPaid}` },
    { label: "Payment Method", value: paymentType },
    { label: "Date & Time", value: paymentCreatedAt },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted dark:bg-gray-900 px-4 sm:px-0">
      <Card className="max-w-md w-full space-y-6 p-4 md:p-6 bg-white rounded-lg shadow-lg border dark:bg-gray-800">
        <div className="flex flex-col items-center">
          <CircleCheckIcon className="text-green-500 h-16 w-16" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-muted mt-4">
            Payment Successful
          </h1>
          <p className="text-muted0 dark:text-gray-400 mt-2">
            Your reports have been successfully purchased. Thank you for your
            purchase!
          </p>
        </div>
        {isLoaded && payment ? (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
            {paymentDetails.map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between gap-1 max-sm:flex-col"
              >
                <span className="text-muted0 dark:text-gray-400">{label}:</span>
                <span className="font-medium text-gray-900 dark:text-muted">
                  {value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Skeleton className="h-40 w-full" />
        )}

        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:bg-muted dark:text-gray-900 dark:hover:bg-gray-200 dark:focus:ring-gray-300"
            prefetch={false}
          >
            Back to Home
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default PricingSuccess;
