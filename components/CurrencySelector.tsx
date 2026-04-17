import { styled } from "nativewind";
import {
    Image,
    ImageSourcePropType,
    Pressable,
    Text,
    View,
} from "react-native";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

interface CurrencySelectorProps {
    icon?: ImageSourcePropType;
    label: string;
    selectedCurrency: string;
    onSelectCurrency: (currency: "USD" | "EUR" | "INR") => void;
}

const CURRENCIES = [
    { code: "USD", symbol: "$" },
    { code: "EUR", symbol: "€" },
    { code: "INR", symbol: "₹" },
];

const CurrencySelector = ({
    icon,
    label,
    selectedCurrency,
    onSelectCurrency,
}: CurrencySelectorProps) => {
    return (
        <StyledView className="px-6 py-4 gap-4">
            <StyledView className="flex-row items-center gap-4">
                {icon && (
                    <Image
                        source={icon}
                        className="size-5"
                        style={{ tintColor: "white" }}
                    />
                )}
                <StyledText className="text-base font-sans-semibold text-white flex-1">
                    {label}
                </StyledText>
            </StyledView>

            {/* Currency buttons */}
            <StyledView className="flex-row gap-3">
                {CURRENCIES.map((currency) => (
                    <StyledPressable
                        key={currency.code}
                        onPress={() => onSelectCurrency(currency.code as any)}
                        className={`flex-1 rounded-xl py-3 items-center border ${
                            selectedCurrency === currency.code
                                ? "bg-accent border-accent"
                                : "bg-white/10 border-white/20"
                        }`}
                    >
                        <StyledText
                            className={`text-sm font-sans-bold ${
                                selectedCurrency === currency.code
                                    ? "text-primary"
                                    : "text-white"
                            }`}
                        >
                            {currency.symbol} {currency.code}
                        </StyledText>
                    </StyledPressable>
                ))}
            </StyledView>
        </StyledView>
    );
};

export default CurrencySelector;
