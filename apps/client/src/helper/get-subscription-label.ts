export const getReportLabel = (range: number, subscription: string) => {
    if (range === Infinity) {
        if (subscription === "monthly") return "Unlimited Reports / month";
        if (subscription === "yearly") return "Unlimited Reports / year";
        return "Unlimited Reports";
    }

    return `${range} Reports`;
};
