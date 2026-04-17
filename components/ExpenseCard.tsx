import { styled } from "nativewind";
import { Text, View } from "react-native";

const StyledView = styled(View);
const StyledText = styled(Text);

interface ExpenseCardProps {
    month: string;
    amount: number;
    percentageChange: number;
}

const ExpenseCard = ({ month, amount, percentageChange }: ExpenseCardProps) => {
    const isIncrease = percentageChange > 0;
    const percentageColor = isIncrease ? "text-destructive" : "text-success";
    const percentageSign = isIncrease ? "+" : "-";

    return (
        <StyledView className="rounded-3xl border border-primary/10 bg-card p-5">
            <StyledView className="flex-row items-center justify-between gap-4">
                <StyledView className="flex-1">
                    <StyledText className="text-xl font-sans-bold text-primary">
                        Expenses
                    </StyledText>
                    <StyledText className="mt-2 text-base font-sans-semibold text-primary">
                        {month}
                    </StyledText>
                </StyledView>

                <StyledView className="items-end">
                    <StyledText className="text-2xl font-sans-bold text-primary">
                        -₹{amount.toFixed(2)}
                    </StyledText>
                    <StyledText
                        className={`mt-2 text-base font-sans-bold ${percentageColor}`}
                    >
                        {percentageSign}
                        {Math.abs(percentageChange)}%
                    </StyledText>
                </StyledView>
            </StyledView>
        </StyledView>
    );
};

export default ExpenseCard;
