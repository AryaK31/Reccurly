import dayjs from "dayjs";

export const formatCurrency = (
    value: number,
    currency: string = "INR",
): string => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return "₹0.00";
    }

    try {
        // Intl is a JS builtin internationalizstion API
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numericValue);
    } catch {
        return `₹${numericValue.toFixed(2)}`;
    }
};


export const formatSubscriptionDateTime = (value ? : string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.format("MM/DD/YYYY") : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};
