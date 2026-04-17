import { styled } from "nativewind";
import { Text, View } from "react-native";

const StyledView = styled(View);
const StyledText = styled(Text);

interface HistoryItemProps {
    name: string;
    date: string;
    price: string;
    backgroundColor: string;
}

const HistoryItem = ({
    name,
    date,
    price,
    backgroundColor,
}: HistoryItemProps) => {
    return (
        <StyledView
            className="flex-row items-center rounded-3xl px-6 py-5 gap-4"
            style={{ backgroundColor }}
        >
            {/* Icon Circle */}
            <StyledView className="size-14 items-center justify-center rounded-full bg-white/30">
                <StyledText className="text-2xl font-sans-bold text-primary">
                    {name.charAt(0)}
                </StyledText>
            </StyledView>

            {/* Content */}
            <StyledView className="flex-1">
                <StyledText className="text-lg font-sans-bold text-primary">
                    {name}
                </StyledText>
                <StyledText className="mt-1 text-sm font-sans-medium text-primary/70">
                    {date}
                </StyledText>
            </StyledView>

            {/* Price */}
            <StyledView className="items-end">
                <StyledText className="text-lg font-sans-bold text-primary">
                    {price}
                </StyledText>
                <StyledText className="mt-1 text-xs font-sans-medium text-primary/70">
                    per month
                </StyledText>
            </StyledView>
        </StyledView>
    );
};

export default HistoryItem;
