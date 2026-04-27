interface GstBreakup {
    basePrice: number;
    gstAmount: number;
}

const GST_APPLICABLE_AMOUNTS = [5310, 3304, 57820, 944];

export function calculateConditionalGst(
    totalAmount: number,
    gstRate = 0.18
): GstBreakup {
    if (totalAmount <= 0) {
        return { basePrice: 0, gstAmount: 0 };
    }

    const isGstApplicable = GST_APPLICABLE_AMOUNTS.includes(totalAmount);

    if (!isGstApplicable) {
        return {
            basePrice: totalAmount,
            gstAmount: 0,
        };
    }

    const basePrice = +(totalAmount / (1 + gstRate)).toFixed(2);
    const gstAmount = +(totalAmount - basePrice).toFixed(2);

    return {
        basePrice,
        gstAmount,
    };
}
